import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { createHmac } from "crypto"

// Create HMAC signature for webhook payload
function createSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    if (webhook.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Webhook is not active" },
        { status: 400 }
      )
    }

    // Create test payload
    const testPayload = {
      event: "test.webhook",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery",
        webhookId: webhook.id,
        webhookName: webhook.name,
        sentBy: session.adminId,
      },
    }

    const payloadString = JSON.stringify(testPayload)
    const signature = createSignature(payloadString, webhook.secret)
    const timestamp = Math.floor(Date.now() / 1000)

    // Create a delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        eventType: "test.webhook",
        payload: testPayload,
        status: "PENDING",
        attempts: 0,
      },
    })

    // Attempt to send the webhook
    let httpStatus: number | null = null
    let responseBody: string | null = null
    let error: string | null = null
    let deliveryStatus: "DELIVERED" | "FAILED" = "FAILED"

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), (webhook.timeout || 30) * 1000)

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Webhook-Timestamp": timestamp.toString(),
          "X-Webhook-Id": delivery.id,
          "X-Webhook-Event": "test.webhook",
        },
        body: payloadString,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      httpStatus = response.status
      responseBody = await response.text().catch(() => null)

      if (response.ok) {
        deliveryStatus = "DELIVERED"
      } else {
        error = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          error = "Request timed out"
        } else {
          error = fetchError.message
        }
      } else {
        error = "Unknown error occurred"
      }
    }

    // Update delivery record
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: deliveryStatus,
        httpStatus,
        response: responseBody,
        error,
        attempts: 1,
        deliveredAt: deliveryStatus === "DELIVERED" ? new Date() : null,
      },
    })

    // Update webhook stats
    if (deliveryStatus === "DELIVERED") {
      await prisma.webhookEndpoint.update({
        where: { id: webhook.id },
        data: {
          totalDeliveries: { increment: 1 },
          successfulDeliveries: { increment: 1 },
          lastDeliveryAt: new Date(),
          lastStatus: httpStatus,
          consecutiveFailures: 0,
          isHealthy: true,
        },
      })
    } else {
      await prisma.webhookEndpoint.update({
        where: { id: webhook.id },
        data: {
          totalDeliveries: { increment: 1 },
          failedDeliveries: { increment: 1 },
          lastDeliveryAt: new Date(),
          lastStatus: httpStatus,
          consecutiveFailures: { increment: 1 },
        },
      })
    }

    // Log to audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.adminId,
        action: "webhook.test_sent",
        resourceType: "WebhookEndpoint",
        resourceId: webhook.id,
        targetOrgId: webhook.orgId,
        details: {
          deliveryId: delivery.id,
          success: deliveryStatus === "DELIVERED",
          httpStatus,
        },
      },
    })

    return NextResponse.json({
      success: deliveryStatus === "DELIVERED",
      delivery: {
        id: delivery.id,
        status: deliveryStatus,
        httpStatus,
        response: responseBody,
        error,
      },
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
