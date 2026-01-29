import { PrismaClient, ServiceClientStatus, ServiceProjectStatus, ProjectBillingType, InvoiceStatus, TimeEntryStatus, ServiceEmployeeStatus, EmploymentType, ServiceVendorStatus, VendorType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

/**
 * Seed realistic data for GWI Services module
 * Creates clients, projects, employees, vendors, time entries, and invoices
 */
export async function seedServices() {
  console.log('📊 Seeding Services data...')

  // First, get or create some employees to use as account managers and project managers
  const employees = await createEmployees()
  
  // Create clients
  const clients = await createClients(employees)
  
  // Create projects for clients
  const projects = await createProjects(clients, employees)
  
  // Create vendors
  const vendors = await createVendors()
  
  // Create time entries
  await createTimeEntries(projects, employees)
  
  // Create invoices
  await createInvoices(clients, projects)
  
  console.log('✅ Services data seeded successfully')
}

async function createEmployees() {
  const employees = [
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@gwi.com',
      phone: '+1-555-0101',
      status: 'ACTIVE' as ServiceEmployeeStatus,
      employmentType: 'FULL_TIME' as EmploymentType,
      hireDate: new Date('2022-01-15'),
      hourlyRate: new Decimal('125.00'),
      annualSalary: new Decimal('260000'),
      weeklyCapacityHours: new Decimal('40'),
      role: 'Senior Insights Consultant',
    },
    {
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      email: 'marcus.rodriguez@gwi.com',
      phone: '+1-555-0102',
      status: 'ACTIVE' as ServiceEmployeeStatus,
      employmentType: 'FULL_TIME' as EmploymentType,
      hireDate: new Date('2021-06-01'),
      hourlyRate: new Decimal('150.00'),
      annualSalary: new Decimal('312000'),
      weeklyCapacityHours: new Decimal('40'),
      role: 'Principal Data Strategist',
    },
    {
      firstName: 'Emily',
      lastName: 'Watson',
      email: 'emily.watson@gwi.com',
      phone: '+1-555-0103',
      status: 'ACTIVE' as ServiceEmployeeStatus,
      employmentType: 'FULL_TIME' as EmploymentType,
      hireDate: new Date('2023-03-10'),
      hourlyRate: new Decimal('100.00'),
      annualSalary: new Decimal('208000'),
      weeklyCapacityHours: new Decimal('40'),
      role: 'Insights Analyst',
    },
    {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@gwi.com',
      phone: '+1-555-0104',
      status: 'ACTIVE' as ServiceEmployeeStatus,
      employmentType: 'FULL_TIME' as EmploymentType,
      hireDate: new Date('2022-09-20'),
      hourlyRate: new Decimal('110.00'),
      annualSalary: new Decimal('228800'),
      weeklyCapacityHours: new Decimal('40'),
      role: 'Data Visualization Specialist',
    },
    {
      firstName: 'Jessica',
      lastName: 'Martinez',
      email: 'jessica.martinez@gwi.com',
      phone: '+1-555-0105',
      status: 'ACTIVE' as ServiceEmployeeStatus,
      employmentType: 'PART_TIME' as EmploymentType,
      hireDate: new Date('2023-08-01'),
      hourlyRate: new Decimal('95.00'),
      annualSalary: null,
      weeklyCapacityHours: new Decimal('20'),
      role: 'Junior Analyst',
    },
  ]

  const createdEmployees = []
  for (const emp of employees) {
    const { role, ...empData } = emp
    const employee = await prisma.serviceEmployee.upsert({
      where: { email: emp.email },
      update: {},
      create: empData,
    })
    createdEmployees.push(employee)
  }

  return createdEmployees
}

async function createClients(employees: any[]) {
  const clients = [
    {
      name: 'TechCorp Global',
      slug: 'techcorp-global',
      industry: 'Technology',
      website: 'https://techcorp.com',
      status: 'ACTIVE' as ServiceClientStatus,
      paymentTerms: 30,
      currency: 'USD',
      accountManagerId: employees[0].id,
      tags: ['enterprise', 'tech', 'retainer'],
      firstEngagementAt: new Date('2023-01-15'),
      lastActiveAt: new Date(),
      notes: 'Major technology company seeking consumer insights for product development. Quarterly retainer agreement.',
      billingAddress: {
        street: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
      },
    },
    {
      name: 'Fashion Forward Brands',
      slug: 'fashion-forward',
      industry: 'Retail & Fashion',
      website: 'https://fashionforward.com',
      status: 'ACTIVE' as ServiceClientStatus,
      paymentTerms: 45,
      currency: 'USD',
      accountManagerId: employees[1].id,
      tags: ['retail', 'fashion', 'luxury'],
      firstEngagementAt: new Date('2023-06-01'),
      lastActiveAt: new Date(),
      notes: 'Luxury fashion brand expanding into new markets. Needs consumer behavior insights.',
      billingAddress: {
        street: '456 Style Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    },
    {
      name: 'HealthWell Pharmaceuticals',
      slug: 'healthwell-pharma',
      industry: 'Healthcare & Pharmaceuticals',
      website: 'https://healthwell.com',
      status: 'ACTIVE' as ServiceClientStatus,
      paymentTerms: 30,
      currency: 'USD',
      accountManagerId: employees[0].id,
      tags: ['healthcare', 'pharma', 'regulated'],
      firstEngagementAt: new Date('2023-03-20'),
      lastActiveAt: new Date(),
      notes: 'Pharmaceutical company researching patient and healthcare provider insights.',
      billingAddress: {
        street: '789 Medical Plaza',
        city: 'Boston',
        state: 'MA',
        zip: '02115',
        country: 'USA',
      },
    },
    {
      name: 'StreamFlow Entertainment',
      slug: 'streamflow-entertainment',
      industry: 'Media & Entertainment',
      website: 'https://streamflow.tv',
      status: 'PROSPECT' as ServiceClientStatus,
      paymentTerms: 30,
      currency: 'USD',
      accountManagerId: employees[1].id,
      tags: ['entertainment', 'streaming', 'prospect'],
      firstEngagementAt: new Date('2024-01-10'),
      lastActiveAt: new Date('2024-01-15'),
      notes: 'Streaming platform evaluating GWI data for content strategy. Proposal pending.',
      billingAddress: {
        street: '321 Content Boulevard',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90028',
        country: 'USA',
      },
    },
    {
      name: 'AutoDrive Motors',
      slug: 'autodrive-motors',
      industry: 'Automotive',
      website: 'https://autodrive.com',
      status: 'ACTIVE' as ServiceClientStatus,
      paymentTerms: 60,
      currency: 'USD',
      accountManagerId: employees[0].id,
      tags: ['automotive', 'enterprise', 'milestone'],
      firstEngagementAt: new Date('2022-11-01'),
      lastActiveAt: new Date(),
      notes: 'Automotive manufacturer using insights for brand positioning and market research.',
      billingAddress: {
        street: '555 Vehicle Way',
        city: 'Detroit',
        state: 'MI',
        zip: '48201',
        country: 'USA',
      },
    },
    {
      name: 'GreenEnergy Solutions',
      slug: 'greenenergy-solutions',
      industry: 'Energy & Utilities',
      website: 'https://greenenergy.com',
      status: 'ON_HOLD' as ServiceClientStatus,
      paymentTerms: 30,
      currency: 'USD',
      accountManagerId: employees[1].id,
      tags: ['energy', 'sustainability', 'on-hold'],
      firstEngagementAt: new Date('2023-09-15'),
      lastActiveAt: new Date('2023-12-01'),
      notes: 'Project paused due to budget constraints. Expected to resume Q2 2024.',
      billingAddress: {
        street: '777 Renewable Road',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA',
      },
    },
  ]

  const createdClients = []
  for (const client of clients) {
    const { billingAddress, ...clientData } = client
    const created = await prisma.serviceClient.upsert({
      where: { slug: client.slug },
      update: {},
      create: {
        ...clientData,
        billingAddress: billingAddress as any,
      },
    })
    createdClients.push(created)

    // Create contacts for each client
    await createClientContacts(created.id)
  }

  return createdClients
}

async function createClientContacts(clientId: string) {
  const contacts = [
    {
      clientId,
      firstName: 'John',
      lastName: 'Smith',
      email: `contact1@client-${clientId.slice(0, 8)}.com`,
      phone: '+1-555-1000',
      title: 'Director of Marketing',
      department: 'Marketing',
      isPrimary: true,
      isActive: true,
    },
    {
      clientId,
      firstName: 'Jane',
      lastName: 'Doe',
      email: `contact2@client-${clientId.slice(0, 8)}.com`,
      phone: '+1-555-1001',
      title: 'VP of Strategy',
      department: 'Strategy',
      isPrimary: false,
      isActive: true,
    },
  ]

  for (const contact of contacts) {
    // Check if contact already exists
    const existing = await prisma.clientContact.findFirst({
      where: {
        clientId: contact.clientId,
        email: contact.email,
      },
    })
    
    if (!existing) {
      await prisma.clientContact.create({
        data: contact,
      })
    }
  }
}

async function createProjects(clients: any[], employees: any[]) {
  const projects = [
    {
      clientId: clients[0].id,
      name: 'Q1 2024 Consumer Tech Insights',
      code: 'PRJ-2024-001',
      description: 'Comprehensive consumer technology behavior analysis for Q1 2024 product planning. Includes device usage, app preferences, and purchase intent research.',
      status: 'IN_PROGRESS' as ServiceProjectStatus,
      billingType: 'RETAINER' as ProjectBillingType,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      budgetAmount: new Decimal('75000.00'),
      budgetCurrency: 'USD',
      budgetHours: new Decimal('500.00'),
      defaultHourlyRate: new Decimal('150.00'),
      completionPercent: 65,
      projectManagerId: employees[0].id,
      tags: ['tech', 'consumer-insights', 'q1-2024'],
    },
    {
      clientId: clients[0].id,
      name: 'Brand Perception Study',
      code: 'PRJ-2024-002',
      description: 'Multi-market brand perception analysis across 15 countries. Measuring brand awareness, consideration, and sentiment.',
      status: 'APPROVED' as ServiceProjectStatus,
      billingType: 'FIXED_PRICE' as ProjectBillingType,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-31'),
      budgetAmount: new Decimal('125000.00'),
      budgetCurrency: 'USD',
      budgetHours: new Decimal('800.00'),
      defaultHourlyRate: new Decimal('150.00'),
      completionPercent: 15,
      projectManagerId: employees[0].id,
      tags: ['brand', 'multi-market', 'perception'],
    },
    {
      clientId: clients[1].id,
      name: 'Luxury Consumer Segmentation',
      code: 'PRJ-2024-003',
      description: 'Deep dive into luxury fashion consumer segments. Identifying high-value customer profiles and purchase behaviors.',
      status: 'IN_PROGRESS' as ServiceProjectStatus,
      billingType: 'TIME_MATERIALS' as ProjectBillingType,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      budgetAmount: new Decimal('95000.00'),
      budgetCurrency: 'USD',
      budgetHours: new Decimal('600.00'),
      defaultHourlyRate: new Decimal('150.00'),
      completionPercent: 45,
      projectManagerId: employees[1].id,
      tags: ['luxury', 'segmentation', 'fashion'],
    },
    {
      clientId: clients[2].id,
      name: 'Healthcare Provider Insights',
      code: 'PRJ-2024-004',
      description: 'Research on healthcare provider decision-making processes and information sources. B2B healthcare insights.',
      status: 'COMPLETED' as ServiceProjectStatus,
      billingType: 'MILESTONE' as ProjectBillingType,
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-01-31'),
      actualEndDate: new Date('2024-01-28'),
      budgetAmount: new Decimal('110000.00'),
      budgetCurrency: 'USD',
      budgetHours: new Decimal('700.00'),
      defaultHourlyRate: new Decimal('150.00'),
      completionPercent: 100,
      projectManagerId: employees[0].id,
      tags: ['healthcare', 'b2b', 'completed'],
    },
    {
      clientId: clients[4].id,
      name: 'Automotive Brand Positioning',
      code: 'PRJ-2024-005',
      description: 'Brand positioning study for new electric vehicle line. Competitive analysis and consumer sentiment.',
      status: 'IN_PROGRESS' as ServiceProjectStatus,
      billingType: 'TIME_MATERIALS' as ProjectBillingType,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-30'),
      budgetAmount: new Decimal('180000.00'),
      budgetCurrency: 'USD',
      budgetHours: new Decimal('1200.00'),
      defaultHourlyRate: new Decimal('150.00'),
      completionPercent: 30,
      projectManagerId: employees[1].id,
      tags: ['automotive', 'ev', 'brand-positioning'],
    },
  ]

  const createdProjects = []
  for (const project of projects) {
    const created = await prisma.serviceProject.upsert({
      where: { code: project.code },
      update: {},
      create: project,
    })
    createdProjects.push(created)

    // Assign team members to projects
    await assignTeamMembers(created.id, employees)
  }

  return createdProjects
}

async function assignTeamMembers(projectId: string, employees: any[]) {
  // Assign 2-3 team members per project
  const teamSize = Math.floor(Math.random() * 2) + 2
  const shuffled = [...employees].sort(() => 0.5 - Math.random())
  
  for (let i = 0; i < teamSize && i < shuffled.length; i++) {
    const roles = ['Lead Analyst', 'Data Analyst', 'Visualization Specialist', 'Research Consultant']
    await prisma.projectTeamMember.upsert({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId: shuffled[i].id,
        },
      },
      update: {},
      create: {
        projectId,
        employeeId: shuffled[i].id,
        role: roles[i % roles.length],
        hourlyRate: shuffled[i].hourlyRate,
        allocatedHours: new Decimal((Math.random() * 200 + 100).toFixed(2)),
        isActive: true,
      },
    })
  }
}

async function createVendors() {
  const vendors = [
    {
      name: 'DataViz Pro',
      slug: 'dataviz-pro',
      type: 'AGENCY' as VendorType,
      status: 'ACTIVE' as ServiceVendorStatus,
      email: 'contact@datavizpro.com',
      phone: '+1-555-2000',
      website: 'https://datavizpro.com',
      paymentTerms: 30,
      currency: 'USD',
      notes: 'Specialized data visualization agency. Used for complex dashboard projects.',
    },
    {
      name: 'Survey Experts LLC',
      slug: 'survey-experts',
      type: 'AGENCY' as VendorType,
      status: 'ACTIVE' as ServiceVendorStatus,
      email: 'info@surveyexperts.com',
      phone: '+1-555-2001',
      website: 'https://surveyexperts.com',
      paymentTerms: 30,
      currency: 'USD',
      notes: 'Survey programming and field management services.',
    },
    {
      name: 'John Anderson',
      slug: 'john-anderson',
      type: 'CONTRACTOR' as VendorType,
      status: 'ACTIVE' as ServiceVendorStatus,
      email: 'john.anderson@freelance.com',
      phone: '+1-555-2002',
      website: null,
      paymentTerms: 15,
      currency: 'USD',
      notes: 'Freelance data analyst specializing in statistical analysis.',
    },
    {
      name: 'Translation Services Inc',
      slug: 'translation-services',
      type: 'SUPPLIER' as VendorType,
      status: 'ACTIVE' as ServiceVendorStatus,
      email: 'contact@translationservices.com',
      phone: '+1-555-2003',
      website: 'https://translationservices.com',
      paymentTerms: 30,
      currency: 'USD',
      notes: 'Multi-language translation services for survey materials.',
    },
  ]

  const createdVendors = []
  for (const vendor of vendors) {
    const created = await prisma.serviceVendor.upsert({
      where: { slug: vendor.slug },
      update: {},
      create: vendor,
    })
    createdVendors.push(created)
  }

  return createdVendors
}

async function createTimeEntries(projects: any[], employees: any[]) {
  const categories = ['Development', 'Analysis', 'Meetings', 'Design', 'Research', 'Documentation', 'Client Communication']
  const statuses: TimeEntryStatus[] = ['APPROVED', 'SUBMITTED', 'DRAFT']
  
  // Create time entries for the last 3 months
  const now = new Date()
  const entries = []
  
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0).getDate()
    
    for (const project of projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'APPROVED')) {
      // Create 3-8 entries per project per month
      const numEntries = Math.floor(Math.random() * 6) + 3
      
      for (let i = 0; i < numEntries; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue
        
        const employee = employees[Math.floor(Math.random() * employees.length)]
        const hours = new Decimal((Math.random() * 6 + 2).toFixed(2)) // 2-8 hours
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const category = categories[Math.floor(Math.random() * categories.length)]
        
        const descriptions = [
          `Worked on ${category.toLowerCase()} tasks for ${project.name}`,
          `Completed ${category.toLowerCase()} deliverables`,
          `Attended client meeting and follow-up work`,
          `Data analysis and report preparation`,
          `Dashboard development and testing`,
          `Research and insights synthesis`,
        ]
        
        entries.push({
          employeeId: employee.id,
          projectId: project.id,
          date,
          hours,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          category,
          isBillable: true,
          hourlyRate: employee.hourlyRate,
          status,
        })
      }
    }
  }
  
  // Create entries in batches
  for (const entry of entries) {
    await prisma.timeEntry.create({
      data: entry,
    })
  }
  
  console.log(`  Created ${entries.length} time entries`)
}

async function createInvoices(clients: any[], projects: any[]) {
  const activeClients = clients.filter(c => c.status === 'ACTIVE')
  
  // Create invoices for completed and in-progress projects
  const invoices = []
  let invoiceCounter = 1 // Global counter to ensure unique invoice numbers
  
  for (const project of projects) {
    if (project.status === 'COMPLETED' || project.status === 'IN_PROGRESS') {
      // Create 1-3 invoices per project
      const numInvoices = project.status === 'COMPLETED' ? 3 : Math.floor(Math.random() * 2) + 1
      
      for (let i = 0; i < numInvoices; i++) {
        const issueDate = new Date(project.startDate)
        issueDate.setMonth(issueDate.getMonth() + i)
        const dueDate = new Date(issueDate)
        dueDate.setDate(dueDate.getDate() + 30)
        
        let status: InvoiceStatus = 'DRAFT'
        if (i < numInvoices - 1) {
          status = 'PAID'
        } else if (project.status === 'COMPLETED') {
          status = 'PAID'
        } else {
          status = Math.random() > 0.5 ? 'SENT' : 'PENDING'
        }
        
        const subtotal = new Decimal((Math.random() * 30000 + 10000).toFixed(2))
        const taxRate = new Decimal('0.08') // 8% tax
        const taxAmount = new Decimal((Number(subtotal) * Number(taxRate)).toFixed(2))
        const total = new Decimal((Number(subtotal) + Number(taxAmount)).toFixed(2))
        const amountPaid = status === 'PAID' ? total : new Decimal('0')
        const amountDue = new Decimal((Number(total) - Number(amountPaid)).toFixed(2))
        
        // Generate unique invoice number using project code and global counter
        const projectCodePart = project.code.split('-')[2] || '000'
        const invoiceNumber = `INV-2024-${String(projectCodePart).padStart(3, '0')}-${String(invoiceCounter++).padStart(4, '0')}`
        
        // Use upsert to handle existing invoices gracefully
        const invoice = await prisma.invoice.upsert({
          where: { invoiceNumber },
          update: {}, // Don't update if exists
          create: {
            clientId: project.clientId,
            invoiceNumber,
            status,
            issueDate,
            dueDate,
            sentAt: status === 'SENT' || status === 'PAID' ? new Date(issueDate.getTime() + 86400000) : null,
            paidAt: status === 'PAID' ? new Date(dueDate.getTime() - 86400000 * 5) : null,
            currency: 'USD',
            subtotal,
            taxRate,
            taxAmount,
            total,
            amountPaid,
            amountDue,
          },
        })
        
        // Check if line items already exist for this invoice
        const existingLineItems = await prisma.invoiceLineItem.findMany({
          where: { invoiceId: invoice.id },
        })
        
        // Create line items only if they don't exist
        if (existingLineItems.length === 0) {
          const numLineItems = Math.floor(Math.random() * 3) + 2
          for (let j = 0; j < numLineItems; j++) {
            const quantity = new Decimal((Math.random() * 50 + 10).toFixed(2))
            const unitPrice = new Decimal((Math.random() * 200 + 100).toFixed(2))
            const amount = new Decimal((Number(quantity) * Number(unitPrice)).toFixed(2))
            
            // Check if line item already exists
            const existingLineItem = await prisma.invoiceLineItem.findFirst({
              where: {
                invoiceId: invoice.id,
                sortOrder: j,
              },
            })
            
            if (!existingLineItem) {
              await prisma.invoiceLineItem.create({
                data: {
                  invoiceId: invoice.id,
                  projectId: project.id,
                  description: `Professional services - ${project.name} (${['Analysis', 'Consulting', 'Reporting', 'Data Processing'][j % 4]})`,
                  quantity,
                  unitPrice,
                  amount,
                  hours: j === 0 ? quantity : null,
                  hourlyRate: j === 0 ? unitPrice : null,
                  taxable: true,
                  sortOrder: j,
                },
              })
            }
          }
        }
        
        invoices.push(invoice)
      }
    }
  }
  
  console.log(`  Created ${invoices.length} invoices`)
}
