# Customer Feedback → Engineering Backlog

_Generated on 2026-01-29 from Featurebase export_

## Venn Diagrams as a Visualization Option to Analyze Audience Overlap

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas, Dashboards, Charts

**Feedback:**

A user at Essence MediaCom (rebekah.thomas@essencemediacom.com) has asked for Venn diagrams to be added as a visualization option for audience overlap. While she currently uses heat maps within Crosstabs to compare two audiences, she would like a more intuitive visual — such as a Venn diagram — to illustrate how multiple audiences intersect.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/venn-diagrams-as-a-visualization-option-to-analyze-audience-overlap)

---

## Bring in more Hubspot Contact Columns

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

Currently raw_p_hubspot.contact table includes the following columns:

1. property_hs_analytics_source

2. property_hs_analytics_source_data_1

3. property_hs_analytics_source_data_2


Could you please bring those into the dwh.dim_hubspot_contacts table as we need them for reporting. (the ETL is already there just need a few more columns)



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/bring-in-more-hubspot-contact-columns)

---

## UI for creating bundled / auto-generated attributes

**Status:** In Review
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Spark, RMP, Internal Data Flows

**Feedback:**

1. Problem:
Currently, in order to create segmentations or auto-generated datapoints in syndicated datasets, we rely on data engineers to handle the data processing. While researchers provide the specs, the delivery time is extended as the process requires multiple back and forth (double checking from both teams, potential typos in the script that require back and forth etc). This dependency slows down workflow and limits flexibility. Having a dedicated UI in RMP—similar to the autocoding tool—would allow researchers to independently create bundled attributes more effectively.

2. Impact:
The current process delays the creation of such attributes and limits researchers’ ability to quickly apply / do trials.

3. Business Case:
If we were able to independently create bundled attributes we will:

·       Enable researches to support Spark with more attributes, aligning with feedback from the Jedi Team

·       Reduce delivery times for such cases

·       Increase efficiency by removing bottlenecks

4. Proposed Solution:

·       Develop a researcher-facing UI that allows creation and management of bundled datapoints/questions

·       Mirror the simplicity and usability of the autocoding tool

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ui-for-creating-bundled-auto-generated-attributes)

---

## Auto-hide/Grey out non applicable waves in Crosstabs

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

The client raised confusion around why Q3 2025 wave was available in Crosstabs to select when they were working with GWI Core.



The client was subscribed to multiple datasets, including GWI Travel, which had just had Q3 2025 wave of data released.



The user found the experience confusing because at that moment, they had only selected GWI core attributes for their Crosstab. The mention it would be great if in addition to ‘pre-selected’ waves it would also be great if non-applicable waves could be hidden or greyed out if there are relevant data sets/attributes for those waves. Similar to how the wave filter works in Charts, whereby only relevant waves are shown after the dataset selection.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/auto-hidegrey-out-non-applicable-waves-in-crosstabs)

---

## Select a preferred language in Spark

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

A few users in France and Spain have started using Spark in their own language. I tested it myself in French and found that while Spark understands non-English requests, it always replies in English.



The current workaround is to send a follow-up prompt asking Spark to translate the insights. While this works, the translated insights are shown in a format that doesn’t allow further interaction or actions.



Many users would benefit from being able to use Spark in their own language. Introducing a feature that lets users set a preferred language would improve usability, remove a key barrier to adoption, and encourage more people to integrate our data into their work.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/select-a-preferred-language-in-spark)

---

## GWI Spark to pull insights from GWI Zeitgeist and add-on datasets

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Hi team, are there any plans for GWI Spark to be able to pull data from our other datasets apart from GWI Core?

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-spark-to-pull-insights-from-gwi-zeitgeist-and-add)

---

## Enhance dim_opportunities with Additional Fields

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

We’d like to enhance the dim_opportunities table with additional fields to support reporting and analysis needs. These fields have been discussed with the team last week.
Requested Fields


1. FORECAST CATEGORY

* Salesforce API: ForecastCategoryName

* Raw Opportunity: forecast_category_name


2. OPPORTUNITY RECORD TYPE

* Salesforce API: RecordType


3. BEST CASE AMOUNT (CONVERTED)

* Salesforce API: ExpectedRevenue

* Raw Opportunity: expected_revenue


4. COMPETITOR NAME

* Salesforce API: Competitor_Name__c

* Raw Opportunity: competitor_name_c


5. CLOSED WON/LOST REASON

* Salesforce API: Closed_Won_Reason__c, Closed_Lost_Reason__c

* Raw Opportunity: closed_won_reason_c, closed_lost_reason_c


6. CLOSED WON/LOST COMMENTS

* Salesforce API: Closed_Won_Comments__c, Closed_Lost_Reason_Other__c

* Raw Opportunity: closed_won_comments_c, closed_lost_reason_other_c


7. REVENUE TYPE FIELDS

* Expansion Revenue: Expansion_Amount__c

* Retention Revenue: Retention_Revenue__c

* New Business Revenue: New_Logo_Revenue__c


8. OPPORTUNITY OWNER REVENUE SEGMENT

* Salesforce API: Opportunity_Owner_Revenue_Segment__c

* dim_salesforce_users: Revenue_Team


9. REVENUE SEGMENT

* Salesforce API: revenue_segment

* dim_accounts: revenue_segment


10. BUSINESS TYPE

* Logic: Same calculation as in fct_sales_transactions


11. OWNER DIVISION

* Salesforce API: user_division_c

* Raw Opportunity Split: owner_division


12. REGION

* Salesforce API: Region__c

* dim_accounts: Region


13. VERTICAL

* Salesforce API: Vertical__c

* dim_accounts: Vertical


14. SUB-VERTICAL

* Salesforce API: Sub_Vertical__c

* dim_accounts: Sub_Vertical


15. RENEWAL DATE

* Salesforce API:renewal_date_c

* Raw Opportunity: renewal_date_c


16. ORIGINAL SOURCE TYPE

* Raw Contract: Original_Source_Type__c


17. OWNER MANAGER

* dim_salesforce_users: name [http://sm.name] AS manager_name (Raw Opportunity_split: manager_c )

----------------------------------------


ADDITIONAL ENHANCEMENT

* Include exchange rates or ensure all opportunity amounts are available in GBP within dim_opportunities.


We recognize region/vertical/sub-vertical and revenue team are already available in dim_accounts, dim_salesforce_users, and fct_sales_transactions. This ticket intentionally denormalizes them into dim_opportunities to reduce joins for analysts and Tableau dashboards.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enhance-dimopportunities-with-additional-fields)

---

## fct_invoices Not Picking Up Full Invoice Values

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

Finance flagged that certain invoices are not being fully captured in the fct_invoices table, which underpins the AR Funnel report. Only ~50% of the total invoiced value is being recorded for some Salesforce (SF) invoices, leading to discrepancies in reporting.

Impact

* May 2025 invoice totals dropped by ~£100k vs. July reporting.

* Finance teams cannot reconcile actual invoicing with the Funnel report, impacting revenue tracking.

Details

* Affected invoices (examples):

* INV-8771 – £150,000 invoiced, fct_invoices shows only £75,000

* INV-8772 – £51,000 invoiced, fct_invoices shows only £25,500

* Issue is not Tableau related (no filtering or calculation issues), but rather related with the data model or ingestion logic.

Screenshots with reported discrepancies attached as well as the Excel file: Invoices new table_data.xlsx (shared by Jelson on Aug 28, 2025).



Thank you!



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/fctinvoices-not-picking-up-full-invoice-values)

---

## Option to add audience title to bar in Chart

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Conde Nast would like to offer the feedback of adding the audience names to the bars in chart. Attached is a mock up

Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/option-to-add-audience-title-to-bar-in-chart)

---

## GWI Spark Feedback

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

A main stakeholder at Publicis had feedback about GWI Spark and some ideas to make it better in the future.

* When typing in a question and wanting to see countries against each other, prompting to be able to see the countries as columns

* She brought up the point that it should be obvious what the sample size of the audience in use is, in case it’s lower than 100.

* Making Spark be able to answer simple questions. I’ve attached a screenshot below of an example of the response (or rather, lack of response) that Spark gives to a simple question: “Can you tell me how many people watch Formula E?”



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-spark-feedback)

---

## Ability to view metadata and question pathway in Crosstabs

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Currently, in crosstabs, you cannot see the pathway or specific data set that an attribute or grouping of attributes belongs to.



When someone has a large crosstabs with multiple dataset mixes, or even if they’re using a custom dataset it’s very hard to know where the question is from and then also what the question notes or metdata are.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ability-to-view-metadata-and-question-pathway-in-crosstabs)

---

## Flexibility in combining relevant slides to one report for Canvas

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Client feedback is they would like Canvas to have more flexibility in combining relevant slides to one report, and add AI generation of texts to accommodate different objectives. For example, if my objective is to understand brands social media movements and audience behavior they could ask canvas to make a report using slides 10-15 from the social audience profiling template and slides 5-12 of the social media report and create one report

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/flexibility-in-combining-relevant-slides-to-one-report-for-canvas)

---

## Changing default data set in platform features

**Status:** Future consideration
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Audiences, Crosstabs, Charts, User Management

**Feedback:**

Hey team, a client asked if it would be possible to change the default data set from Core to USA. The client subscribes to both data sets but uses GWI USA more. In our platform features like audience builder, Core is always selected as the default and they would like to have GWI USA as their default. I think it could be a great feature to change your default data set.

Let me know if you have any questions about this.

Thanks :)

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/changing-default-data-set-in-platform-features)

---

## Cleaner Display for Averages in Crosstabs

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Feedback:**

When showing averages in crosstabs, could we remove the extra text/units from the fields? For example:

* 48.15 instead of 48.15039 years (age)

* $95,871 instead of 95870.90814 USD (income)

* $375,154 instead of 375154.09441 USD (assets & investments)

Right now, when we download crosstabs and run lookups, the extra text makes it harder — we have to run find/replace steps to clean the cells. Having just the rounded numbers would make the output much quicker and easier to use.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/cleaner-display-for-averages-in-crosstabs)

---

## Folder Organization in Shared Tab

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Feedback:**

Right now, the Shared tab only shows individual items, which gets messy fast. If we could create folders in Shared, teams could group things like Total Reach, Print, Digital, and Social Media instead of sharing each brand or report one by one.



Why it’s better:

* Keeps things organized and easy to find.

* Saves time (no more sharing 20 links separately).

* Makes it easier for teams to collaborate and onboard.

Example: Instead of 20 shared brand dashboards, just share four folders: Total Reach, Print, Digital, Social Media. Simple and clean.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/folder-organization-in-shared-tab)

---

## Free Users in Charts

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

It would be great if when a Free user clicks on a data set in Charts, they can immediately see which ones they have access to before clicking into a data set - can easily make this clear with the crown emoji

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/free-users-in-charts)

---

## Monthly Snapshot of fct_sales_transactions table

**Status:** In Progress
 | **Upvotes:** 0
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

To enable historical comparisons and point-in-time reporting which is essential for commercial finance/finance, we need to create a recurring monthly snapshot of the fct_sales_transactions table. This snapshot should reflect the table's state as of the 2nd working day of each month, based on the revamped logic defined in the updated version of the table (see ticket for revamping fct_sales_transactions table).

Scope of Work:

* Capture a full snapshot of the revamped fct_sales_transactions table each month.

* Trigger the snapshot on the 2nd working day of the month.

* Store each snapshot in a consistent and queryable format, ideally:

* A single snapshot table with a reference column reference_date

Engineering can propose the most efficient structure depending on performance, ease of querying, and integration.

The final snapshot table should be designed for easy Tableau consumption, allowing end users to:

* Filter by reference_date

* Compare metrics across monthly versions

* Build time-aware dashboards for ARR and transaction metrics

* We would like to recreate AR-line-by-line reporting as well as ARR bridge based on these historical data



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/monthly-snapshot-of-fctsalestransactions-table)

---

## Revamp fct_sales_transactions Table – ARR Integration & Structural Enhancements

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

We are rolling out a revamp of the fct_sales_transactions table to:

* Bring ARR from Salesforce directly into our core reporting table

* Apply a series of schema, logic, and structural improvements proposed by the CA team

* Improve overall reporting accuracy, logic simplicity, and resilience


Scope:
This initiative includes:

* Ingesting and integrating ARR from Salesforce

* Updating logic and structure of the Sales Transactions model

* Improving field clarity and business alignment

* Removing unused complexity (e.g., cancellation joins)



CHANGES INCLUDE:

1. IMPROVED ORDER ITEM CANCELLATION FLAG

* is_sale_cancelled logic simplified to:

nav_hold_billing_reason_c = 'Order Cancellation'

* Removed cancelled_order_item_id & cancelling_order_item_id from sale_transaction_key

2. BILLING FIELDS EXPANSION

* Added:

* billing_amount_without_tax

* pending_billing_amount_without_tax

* billed_tax

* cancelled_billing_amount_without_tax

* billing_day_of_month

* invoice_batch

* bill_now

3. REVENUE & PRODUCT ENHANCEMENTS

* Added renewable_base, stamped_renewable_base (from Opportunity)

* Added plan_type, product_status (from raw Product, ideally we would like these fields added in dim_products but please let us know if it’s possible)

4. IMPROVED DATE HANDLING

* New start_date_key and enriched end_date_key reduce “unknown” keys and better align ARR with activation and cancellation realities. Expect improved reconciliation vs finance/Berni’s numbers.

5. ARR LOGIC REVAMP

* Uses nav_hold_billing_reason_c drive logic to exclude cancelled order items

7. REMOVED SELF-JOINS FOR CANCELLATION

* Dropped LEFT JOINs to compute cancellation mapping fields

* Logic now handled with simpler boolean flags



Attachments:

* Txt file with the revamped code

* Cases where ARR was not calculated correctly due to not identifying order item cancellations correctly



Please let me know if you need more information from our side.

Thank you!








**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/revamp-fctsalestransactions-table-arr-integration-and-structural-enhancements)

---

## Platform API - using with Dashboards

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 🔗 API

**Tags:** Dashboards, Platform API

**Feedback:**

Hey team, a user from Amazon asked if it’s possible to use the Platform API in combination with Dashboards. They would like to connect to the GWI dashboard by API, and manage Audience and Locations via the API dynamically.



Since this isn’t possible at the moment, it would be really great if this could be added to our platform API offering.



Let me know if you need further information.



Thanks :)

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/platform-api-using-with-dashboards)

---

## Duplicate more than one column/row in a crosstab

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

My client had multiple columns in a crosstab that they also wanted to add them as rows. When selecting, say, 3 columns and clicking on the 3 dots to duplicate, it would only duplicate the column where the 3 dots were clicked on. Therefore, they could only duplicate one column at a time, to then drag it to a row when they wanted to do this for more than one.



This would save a huge amount of time instead of clicking through the questionnaire, selecting individual datapoints and being able to duplicate multiple columns/rows at once, then dragging and dropping.



I know we can drag and drop multiple columns/rows at once, but we can only duplicate one at a time currently.



Thank you

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/duplicate-more-than-one-columnrow-in-a-crosstab)

---

## Add a level of rebasing in Crosstabs

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

I have several clients who would like to add another layer of basing in crosstab. Here is an example:

* I want to profile NBA Fans across different markets using cross-tab

* My study base is gen pop, and I wanted to break down my results by gender (column) and age group (row)

* I also want to add a base by market, which works fine

* But then I also want to apply my NBA Fan audience and in order to do that I need to affix each market base with my NBA Fan audience (and in this case I have 31 markets)

In short:
It would be incredibly useful to have the ability to apply filters like market and audience separately from the base layer, so we can avoid duplicating audience expressions per market.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-a-level-of-rebasing-in-crosstabs)

---

## Upload Monthly Invoicing and Cash Targets to tbl_sap_ar_targets

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Feedback:**

New monthly invoicing and cash targets have been provided by Ciaran for the current financial quarter. Please upload/update these targets in the table tbl_sap_ar_targets.

This update is required for accurate tracking within the AR Funnel Tableau report, where targets are blended with actuals.


I am attaching the excel file with the new targets shared by Ciaran.



Thank you in advance!
Marianna

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/upload-monthly-invoicing-and-cash-targets-to-tblsapartargets)

---

## Enable deeper insight investigation in Canvas

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Hi team,



Gameloft mentioned that it would be really valuable to have a way to deep dive into specific insights pulled by Canvas — for example, to explore the remaining datapoints within a question or to apply segmentation.



One possible solution could be to link the graphs in Canvas directly to the corresponding question in Charts, similar to how we have the “View in charts” option in Dashboards or the “Explore data” chart links in our reports. This would give users more flexibility to explore the data in greater depth.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-deeper-insight-investigation-in-canvas)

---

## Enable wave selection in Canvas

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Hi team, Gameloft has requested the ability to select specific waves in Canvas, allowing them to customize the timeframe of the data being pulled.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-wave-selection-in-canvas)

---

## Hard to read truncated text in Charts

**Status:** Completed
 | **Upvotes:** 9
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Hi team, one of my clients found it hard to read the truncated text in Charts. I also noticed this change quite recently, and agree with the client.



Is it possible to increase the number of characters that Charts display?



I have attached a screenshot of the Old Charts and current Charts.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/hard-to-read-truncated-text-in-charts)

---

## Updates to GWI Canvas tableau dashboard

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Canvas

**Feedback:**

We would like Highspot and Clari Co pilot metrics added into the GWI Canvas Tableau dashboard, so we can report on revenue metrics and product metrics in one central place

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/updates-to-gwi-canvas-tableau-dashboard)

---

## Metrics for Data Ops (Custom Board - DPS)

**Status:** Completed
 | **Upvotes:** 4
 | **Board:** Business Intelligence

**Feedback:**

Type

Type examples

Problem / Need

Audience

New Idea

* New data source/table extraction



As a Project Delivery Manager in the Data team, I manage task distribution across our team using the Data Plans (DP) Jira board. Researchers create Jira cards for custom data tasks. Once cards move to the "Data Team: Ready" status, we pick them up. These often come with tight deadlines.

Manually each month, I:

* Check how many cards left the "Data Team: Ready" status each month

* Track complexity via Jira labels (“Low_Complexity”, “Medium_Complexity”, “High_Complexity”)

* Calculate time spent per card via Clockify integration (shown in Jira in seconds in the column “Time Spent”)


As a
Project Delivery Manager

When I review my team’s performance monthly (e.g. around the 15th for the previous month)
I want to automate data extraction and metrics summary
So I can stop writing JQLs and importing/exporting data into Google Sheets manually


Removes manual, repetitive monthly reporting

* Ensures consistent, timely performance tracking

* Gives visibility into workload, complexity, and resourcing


JQL I used:

project = DP AND status changed FROM "Data Team: Ready" DURING (startOfMonth(-1), endOfMonth(-1))

Exported the CSV with my default columns including Labels, Time Spent

Primary: Data Ops

Secondary: Researchers (more visibility into throughput, complexity)



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/metrics-for-data-ops-custom-board-dps)

---

## Reduce number of devices clients can sign in to platform on to 1

**Status:** In Review
 | **Upvotes:** 11
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

I would like to make a request that we begin limiting our platform users to one device instead of two as it is restricting the level of revenue we generate within the business.



Clients are commonly having 2 users per license which while in breach of their terms, we are unable to enforce.



In an ideal world we would be able to decide the numbers of devices available per user as this would enable us to allow two devices in the very limited circumstances where people have a genuine need for it and ensure that accounts we know are account sharing can be restricted to just one.



Within the Majors revenue org we have plenty of evidence demonstrating where we are losing out on money because people wont pay for users they currently see as getting for free.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/reduce-number-of-devices-clients-can-sign-in-to-platform)

---

## Show details of AI-generated audiences in Canvas

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

It would be very helpful to give users visibility into how AI-generated audiences are built within Canvas.

At the moment, there’s no way to inspect the attributes or logic behind these audiences directly in the platform, making it difficult to understand how results are being generated, or troubleshoot when outputs don’t look right.


Our team currently works around this by using DevTools to extract the instant audience ID and manually pasting it into the Audiences tool. But this is a little too fiddly to show clients and not all GWIers will be able to do this with confidence.


Example in this Loom:

https://www.loom.com/share/d58ce6d2c8da465bb6802a292844725f?sid=07d4cca4-883c-447f-9151-21a63ba2789c [https://www.loom.com/share/d58ce6d2c8da465bb6802a292844725f?sid=07d4cca4-883c-447f-9151-21a63ba2789c]





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/show-details-of-ai-generated-audiences-in-canvas)

---

## Include Saved audiences events in the our Spark data model

**Status:** Completed
 | **Upvotes:** 3
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

Saved audiences [https://globalwebindex.atlassian.net/jira/discovery/share/views/dde36490-5142-4cc3-98b1-66ccde7487cb?selectedIssue=PROD-88&issueViewSection=comments] are coming to Spark and additional metrics will be required. The feature will be accompanied [https://docs.google.com/spreadsheets/d/1lFZ-vSukOGaM0proxrF5Fjzs6T4wbrW0NDG651wsHrk/edit?gid=0#gid=0] by 3 additional P2 - Jedi events and additional properties for P2 - Jedi - Query submitted. The feature will be released on 13/8, it would be great to have our models updated so we capture data from day one. The events are already in pro_production.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/include-saved-audiences-events-in-the-our-spark-data-model)

---

## Specify Canvas insights are based on index scores

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** Customer Insight

**Tags:** Canvas

**Feedback:**

While working on this ticket [https://help.globalwebindex.com/en/tickets-portal/companies/54db66bc1e921134da0004d3/tickets/215469953692047], we found out that the insights Canvas picks for a report are based on the index scores.
For example, in the below screenshot, 65+ are only shown because they're more likely than other age groups to own a Toyota vehicle (index: 157,3), although in terms of audience %, this figure is pretty low (6%).



Would it be possible to state on the Canvas report that metrics are selected based on index scores, even though the shown figures are usually the audience %?

This would allow users to clearly understand the logic behind Canvas reports and avoid confusion.



Thanks,

Elena



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/specify-canvas-insights-are-based-on-index-scores)

---

## Using AI to model and predict future trends

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs, Charts, Dashboards, Other

**Feedback:**

Not sure which category this falls under, but client is suggesting that we use AI to make a prediction of future trends, and when the actual data is collected, we can see how accurate the actual results are.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/using-ai-to-model-and-predict-future-trends)

---

## More customisation in GWI Canvas

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Client has asked to explore the possibility of changing out the data points in Canvas. For example, ‘Living arrangements’ in the Demographic slide may not always be relevant to them, but they might want to switch it to another attribute.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/more-customisation-in-gwi-canvas)

---

## Option to uncheck Average Person in GWI Canvas

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

The global average person may not always be relevant to the clients when generating a report in GWI Canvas. They’ve suggested to have an option to uncheck that.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/option-to-uncheck-average-person-in-gwi-canvas)

---

## Spark - not pulling insights for hispanic datapoint in core.

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Client asked Spark what % of Hispanics in the US are Soccer fans and Spark said it was unable to find any audiences.

Client then went into crosstabs to pull the data instead



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/spark-not-pulling-insights-for-hispanic-datapoint-in-core)

---

## Issue with renewable_base_c and stamped_renewable_base_c fields in Raw Opportunity Table & Request to add to dim_opportunities

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

We explored the field renewable_base_c in the Raw Opportunity table from Salesforce and observed that it is populated for only 1,211 opportunities. However, upon inspecting specific examples directly in Salesforce, we noticed that while the field is correctly populated in Salesforce, corresponding values are missing in the BigQuery table. After checking with Sabina, we learned that most of these opportunities with renewable_base_c populated have already been deleted from Salesforce.



Also, it's worth noting that the field stamped_renewable_base_c is populated more frequently than renewable_base_c. Interestingly, we also identified a specific case where the stamped_renewable_base_c field is null in Salesforce but populated in the BigQuery table, indicating a possible inconsistency.



Additionally, could we please have both columns (renewable_base_c and stamped_renewable_base_c) added to the dim_opportunities table?



Request:

* Investigate how these two fields (renewable_base_c and stamped_renewable_base_c) are populated.

* Add both columns (renewable_base_c and stamped_renewable_base_c) to the dim_opportunities table.

Attachments:
I have attached screenshots from 3 example opportunities illustrating these issues.



Thank you!!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/issue-with-renewablebasec-and-stampedrenewablebasec-fields-in-raw-opportunity-table)

---

## More colors for audiences in Charts

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

The user encountered an issue whereby after 6 audiences, the colours repeated themselves and therefore, when reviewing the chart there was no way to distinguish (in an export especially) which row of data belonged to which audience.



Slack thread for reference:

https://globalwebindex.slack.com/archives/C02V06P2TSM/p1752660244787009 [https://globalwebindex.slack.com/archives/C02V06P2TSM/p1752660244787009]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/more-colors-for-audiences-in-charts)

---

## Setting up sharing of charts/audiences/crosstabs for internal users to client orgs, without having to move across organisations.

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences, Crosstabs, Charts

**Feedback:**

A requester from CS flagged that it would be very beneficial of the team to have the ability to share platform assets with clients (something similar as the flag “

Dashboards GWI creator (Product Only)“), without having to change their organisation in admin, and then going back to their own organisation.

Let me know if you need further info on this, thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/setting-up-sharing-of-chartsaudiencescrosstabs-for-internal-users-to-client)

---

## Small changes to make Survey Checker more User Friendly

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** RMP

**Feedback:**

Heya, I have recently used Survey checker after a long period of time and there are quite a few niggly issues which would make the process slightly smoother, if ironed out. The majority of times, survey checker throws out 200+ rows and we have to comb through it to find only around 5 rows which are useful feedback. I have outlines some of these below":

1. Randomisation of groups isn’t recognised so so the error comes out as ‘Randomization format mismatch’ but its just because the datapoints are grouped

2. Within the Input sheet template, column E is titled ‘New_option/Remove_option’ - however these words aren’t recognised by survey checker so each time I have to change the text in the colums to new_datapoint OR remove_datapoint otherwise RMP will flag the downlad as a fail due to error. This is also case sensitive which can be slightly annoying

3. Punctuation is not recognised. If we have [inst] or *** for question or instruction text within dash then it flags as a text mismatch

A. Further to this, its the same for datapoints which have apostrophes or dashes, survey checker will not pull through the correct text and flag this as text mismatch

4. Localisation at question level is not recognised

5. Markets aren’t feedback in alphabetical order (minor issue but slightly annoying to cross check against the EM where we keep it all in alphabetical order)

Sorry if this sounds picky but I know this would save quite alot of time across the projects as they have been issues since the beginning of survey checker. Other than that this tool is really useful for flagging big issues we could easily miss.

Thanks



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/small-changes-to-make-survey-checker-more-user-friendly)

---

## Clickable change tracker status over filter by

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** RMP

**Feedback:**

It would be slightly quicker and easier to filter by the change tracker row status (e.g. approved, for checking etc) by just clicking on the status label on the status row.

This isn’t an essential feature, but it would save a few clicks using the filter feature. So a nice to have.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/clickable-change-tracker-status-over-filter-by)

---

## Enable embedded link or Help center article tagging in Dashboards

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

Hi team!



It would be great if we could enable embedded link or help center article tagging in the text boxes in Dashboards.



Please see the screenshot below on how that could be beneficial:





Thanks!

Rosane

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-embedded-link-or-help-center-article-tagging-in-dashboards)

---

## Fix Sign Handling for Credit Transactions in journal_jdt within fct_management_accounts

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

A transaction in the June 2025 Tableau MA Pack report is showing an incorrect sign: expected -£4500, but displaying +£4500.

After investigation, I found the issue originates from fct_management_accounts, specifically the journal_jdt CTE.


This CTE pulls from SAP’s JDT1 table (via journal_base), but unlike other journal CTEs (e.g., journal_inv, journal_rin), it does not include logic to transform the sign based on debit_credit or other flags.



Therefore, credit amounts are passed through as positive values, leading to incorrect sign representation in downstream layers.



I confirmed:

* The transaction does not appear in fct_invoices, only in journal_jdt

* No transformation logic adjusts sign in journal_jdt

* Other journal CTEs do apply CASE logic to reverse credit signs

Suggest reviewing the logic in journal_jdt to align it with other journal types and ensure correct sign handling.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/fix-sign-handling-for-credit-transactions-in-journaljdt-within-fctmanagementaccounts)

---

## Ability view the question/s an attribute belongs to

**Status:** Rejected
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Currently in crosstabs when you had an attribute from a question, once applied you can nol longer see which question the attribute belongs to and you can do the ‘view question’ feature like in charts to quickly see questions and other relevant metadata/compatibility information.



As a member of the product experience team, where we’re having to troubleshoot user’s issues consistently having this ability would be so useful. I can also see a clear use case of where client would find this useful especially when working with a lot of data from different questions and data sets.



The warning in crosstabs also aren’t very clear so you’re working with very little in terms of guidance of how to find what/where the attribute has come from.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ability-view-the-questions-an-attribute-belongs-to)

---

## Potential fix to improving search function in platform

**Status:** Planned
 | **Upvotes:** 5
 | **Board:** 📊 Platform

**Tags:** Other

**Feedback:**

Netflix reported the following frustrations when using our search function on their title level custom study which tracks 598 different Netflix shows:

- Relies too heavily on semantic search and word stemming, returning many irrelevant results
- Difficult to search for exact phrases or specific terms
- Returns dozens of unrelated results when searching for specific show titles
- No option for exact string matching (like using quotes in Google search)
- Frustrating when trying to find specific data points or questions
- Forces users to filter through many irrelevant results

As above, they suggested we could incorporate quotation matching, so if they are (for example) looking for a datapoint for their show “Dubai Bling” when you put the show in quotations then it will only isolate options that mention the show Dubai Bling and include nothing else. Appreciate this would require development but would be a massive improvement for the whole platform that I know all clients would be grateful for

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/potential-fix-to-improving-search-function-in-platform)

---

## Setting up Intercom to update new GWIers "Company name" field automatically

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Feedback:**

We’d like to start updating the “Company name” field of new GWIers automatically.

As you may be aware by now, we’ve fully migrated our support from Zendesk to Intercom. To view the Tickets Portal [https://help.globalwebindex.com/en/tickets-portal/companies/54db66bc1e921134da0004d3], users need to be assigned to a specific company in Intercom. For our case, as we are using the portal for GWIers only, they need to be assigned to “GWI”.



GWIers not being able to see the tickets portal may not be able to collaborate with other team members on existing tickets (in escalation or cases of sharing), or not be able to check whether their issue was also raised in the past, and they may be able to figure out a solution, without having to raise a new one.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/setting-up-intercom-to-update-new-gwiers-company-name-field)

---

## Changing the language of the Platform interface

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards, Other

**Feedback:**

A requester in Intercom [https://help.globalwebindex.com/en/tickets-portal/companies/54db66bc1e921134da0004d3/tickets/215469804388486] was wondering whether a client could change the language of the platform (specifically DBs) to Dutch, and then to English again.

I am aware that at the moment we are only supporting english, are we thinking of adding more languages down the line?
Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/changing-the-language-of-the-platform-interface)

---

## GWI Canvas - update description for Ad sales goal

**Status:** Completed
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

I just read the description for the "‘Coming soon” Ad sales use case in Spark, and part of the description needs to be removed.



It mentions helping them “reduce wasted media spend”, which would be more applicable to the Media planning goal - e.g. for those buying ads. The Ad sales goal will be for those selling ads.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-canvas-update-description-for-ad-sales-goal)

---

## Single Device login

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

Hi Team, almost every client I work with is showing signs of mass sharing their logins among teams. Are we looking into implementing anything that will prevent this - the 2 device method isn’t working. Even with the new ratecard, if clients are sucessfully sharing logins, growth won’t be as significant

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/single-device-login)

---

## Add GWI data referencing button to Spark

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Spark, Crosstabs, Charts, Dashboards

**Feedback:**

Hi team!



Thisis mor eof a nice to have, I think it would be quite helpful to have a button in Spark (and perhaps even across the other sections of the platform) where clients can quickly click and get the formatted GWI referencing, being able to copy and then easily add to their work or share on social media (eg. GWI Core, Q4 2021, internet users aged 16-64).



I’ve had clients calling me in the past just to ask about referencing, so I think this would be very helpful as it will make their lives easier whenever needing to reference our data.



Thanks!



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-gwi-data-referencing-button-to-spark)

---

## Add link to new datapoints in release notes

**Status:** In Review
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Homepage, Charts

**Feedback:**

Hi team! Our clients frequently request that we highlight the specific new datapoints/attributes that have been added to each new wave of data released. Could we please specify these in more detail in the monthly Release Notes (in the Help Center) and link them to the chart so they can see through the pathway where to find these?



This would be really helpful! :)



Many thanks in advance!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-link-to-new-datapoints-in-release-notes)

---

## Auto update Bundles in Sequoia service

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** RMP, User Management

**Feedback:**

* In order to enhance user experience in Sequoia/Labels service we would like to allow users auto-updating bundles when publishing to next environment

* The problem:

* User creates taxonomy in Sequoia service → publishing to staging and production

* User creates bundles for both staging and production

* E.g. new wave → Taxonomy is updated (new categories are added)

* User publishes updated taxonomy to staging and production

* User need to go to admin again → find the bundles → update them accordingly

* We’d like to automate this step. While publishing user would have an option to auto-update related bundles


This effort Is currently blocked as few dependencies are required. More in a ticket bellow - User Management backlog: https://globalwebindex.atlassian.net/browse/UMDA-2572?atlOrigin=eyJpIjoiNGVjZjk3NDE3NDA5NDAxOThkNDA3ZTFlYzI4ZDQ5YjQiLCJwIjoiaiJ9 [https://globalwebindex.atlassian.net/browse/UMDA-2572?atlOrigin=eyJpIjoiNGVjZjk3NDE3NDA5NDAxOThkNDA3ZTFlYzI4ZDQ5YjQiLCJwIjoiaiJ9]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/auto-update-bundles-in-sequoia-service)

---

## Enable location selection in Canvas

**Status:** Planned
 | **Upvotes:** 7
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Hi team, and Edelman user (Koen.Reynaert@zenogroup.com [Koen.Reynaert@zenogroup.com]) has requested to enable location selection in Canvas rather than have all markets by default. He needed to look at the USA only.



Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-location-selection-in-canvas)

---

## Dashboard Poor Performance

**Status:** Planned
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

Hi team, Adidas has flagged continued performance issues when using dashboards. They've shared a recording replicating the issue, I’ve recorded it here on Loom, [https://www.loom.com/share/3eb44d50daf74a548872c375e4423ff6?sid=3fdd6385-c58e-468d-b96d-0230648036bb] as I was unable to share it directly. Overall, the response is very slow, I’ve already advised them to clear cookies and cache. We are about to help building a series of dashboards for them to incentivise and increase usage and team collaboration among the users, they have already stated that the dashboard performance will be fundamental for them to decide whether to adopt it or not among the team, so this could potentially affect the number of users come renewal time.



Could you please check and advise?



Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dashboard-poor-performance)

---

## Sub-folders for audience management

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

OMG EMEA has asked if it would be possible to create sub-folders within folders on the Audiences management page. Their specific reasoning for this is “This would enable us to create a client folder and organise separate folders for each project inside these client folders.”



There are hundreds of agency users that would be impacted by this, who work with multiple clients, who each have multiple different projects. If we were able to implement this across all areas of the platform (my audiences, shared audiences, audience browser, Spark when audiences are launched), it would be a huge time saver and create organisational efficiencies for users.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/sub-folders-for-audience-management)

---

## Attribute search function

**Status:** Future consideration
 | **Upvotes:** 5
 | **Board:** 📊 Platform

**Tags:** Audiences, Crosstabs

**Feedback:**

When trying to search within a filtered list or specific question options, the search does not behave as expected. Instead:

* It returns results from outside the dataset / question I’m working with, or

* It searches across broad folders or categories, rather than within the specific options I need.

In the example below, instead of narrowing down to the brand within the question, the search jumps outside the question entirely.



For CSI Team workflows, where we often handle long lists of brands, this functionality would significantly improve efficiency and reduce manual scrolling.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/attribute-search-function)

---

## Adding Colour Options In Charts

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Charts, Canvas

**Feedback:**

During a call with a client, I was showcasing the capabilities of Canvas. They were particularly excited about the option to personalise the deck using their organisation’s brand colours. Given that they frequently include chart screenshots from GWI in their presentations and client communications, they expressed a strong interest in having a similar level of customisation for Charts.



Implementing the ability to customise chart colours in line with the organisation’s branding, similar to the Canvas functionality would enhance consistency in their visual communications and significantly improve the user experience for clients who rely heavily on brand alignment.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/adding-colour-options-in-charts)

---

## Enable question selection in Canvas

**Status:** In Review
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Hi team, Adidas has requested the ability to select the questions that appear in the slides, allowing them to customise them to their own needs.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-question-selection-in-canvas)

---

## GWI Sports in Canvas

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Hi team, Adidas has asked if other datasets could be added to Canvas, especially GWI Sports. This would make them adopt the feature.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-sports-in-canvas)

---

## GWI logo on all Canvas slides for GWIers

**Status:** Planned
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

For GWIers who are creating Canvas decks to be used in their outreach to clients/prospects, can we include a GWI logo on the bottom of each slide so it’s branded (in the same way all our collateral is).

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-logo-on-all-canvas-slides-for-gwiers)

---

## Attribute Search in Crosstabs Not Prioritizing Most Relevant Results

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

1. When users search terms like "B2B Purchase Influencers" or "Media Consumption" in the attribute search bar within Crosstabs, the most relevant or closely matching survey sections aren’t appearing at the top of the results. Users need to scroll or dig through the list to locate the desired profiling points, even when their search terms closely align with existing attributes. Adjusting filters to Core and sorting A to Z helps slightly, but doesn’t solve the core issue of relevance-based search behavior.

2. All users using the Crosstabs attribute search function are effected.

3. While this issue doesn’t block any functionality, improving the attribute search logic would significantly enhance the user experience, making search more intuitive and reducing time spent manually finding attributes.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/attribute-search-in-crosstabs-not-prioritizing-most-relevant-results)

---

## Low Sample Size Filter Toggle in Crosstabs

**Status:** Completed
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Crosstabs, Charts

**Feedback:**

Hi team, we met with Edelman in person and they would like to be able to visualise only data with robust sample size across the platform, especially in the crosstabs.

They suggested that anything with fewer than 50 respondents be filtered out of view, allowing them to focus on the more robust figures.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/low-sample-size-filter-toggle-in-crosstabs)

---

## Increase Cell Capacity in Crosstabs

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hi team, we met with Edelman in person and they asked if it would be possible to increase the number of cells to 60k (or enough to cover every single one of the 50K+ profiling points in GWI Core).



They would like to be able to profile an audience against all profiling points available in GWI Core at once in the Crosstabs to increase work efficiency.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/increase-cell-capacity-in-crosstabs)

---

## Statistical Significance Calculator in Crosstabs

**Status:** Future consideration
 | **Upvotes:** 10
 | **Board:** 📊 Platform

**Tags:** Crosstabs, Charts

**Feedback:**

Hi team. We met with Edelman in person, and they have asked if we could implement a statistical significance calculator into the platform, especially in Crosstabs. In addition, they have also asked to filter out non-robust sample sizes from view, so if we could also apply a filter option for that it would be great.



They want the platform to weigh the data and give the statistical significance, being able to provide the difference among different audiences rather than Gen Pop.

They are currently having to make reports using SPSS software to enable them to calculate the statistical significance, which can be very time-consuming.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/statistical-significance-calculator-in-crosstabs)

---

## Text capabilities in Canvas

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Note: I know we are super early doors with this, and these things might be in the pipeline or have already been considered. These ideas came to mind whilst using GWI Canvas and wanted to share!



Idea 1: It would be good at some point to look into text capabilities to see if we can have something clear to users to enable them to see options for bold, italics, different heading sizes, bullet points i.e. as shown below:



I was able to make the text bold, through knowing cmd+B but not all users may know this.



Idea 2: Have we considered allowing users to move the text boxes around? or adding in something like content blocks? I.e. when im in other tools (unrelated), i like the freedom of having text in different places and not being limited to just one space.



Idea 3: Whilst most that needs to be edited can be, when i was creating a deck, i would have loved to have edited the audience titles in the initial few slides. i.e. i have “beauty: beauty buyers” / “Generation: Gen Z” / “Sports": watch/follow football events” i.e. the below:



something of which i’d prefer to just have “Beauty buyers”, “Gen Z” etc.

* Totally appreciate theres likely not flexibility for this, especially as these titles are linked to the generated audiences and are shown throughout the deck. Wanted to float the idea nevertheless!



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/text-capabilities-in-canvas)

---

## Spark trends report using Tableau Pulse

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Feedback:**

Context:

In the Funnel Optimisation group, members requested the automation of the Spark trends report, suggesting the use of the new Tableau Plus and its Pulse feature as a proof of concept. The list of metrics to include in this first version is:

# of users with Spark access 

WAU

MAU 

Spark accuracy (%) [https://docs.google.com/document/d/1zym24DwMTgPPrt-fNVP_DIj9Wo3ivbzCxWpB26eulyM/edit?usp=sharing]

# First Time Prompters

Activation Rate

# of users exploring insights 

# Prompts per User

Total Prompts Submitted

30D (4 week) retention


Also, here’s the Report as it is at the moment: https://docs.google.com/document/d/1ytFSdWjrLyknSAmQoJzsUIUefgKlH897g_FVZnVmGHw/edit?tab=t.0#heading=h.5ifrfim5vv9x [https://docs.google.com/document/d/1ytFSdWjrLyknSAmQoJzsUIUefgKlH897g_FVZnVmGHw/edit?tab=t.0#heading=h.5ifrfim5vv9x]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/spark-trends-report-using-tableau-pulse)

---

## Locations filter should update when using Core with add-on data points

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hey team, since we can use Core data points with add-on data points directly from each folder it can be challenging to use the locations filter. So for instances if I add Core data points to a crosstab and then cross those with data points from GWI Sports the location filter still shows that all Core markets are selected even though these locations aren’t part of Sports. I could adjust the locations filter manually however then I need to know which markets are part of Sports. I think one solution could be to grey out all Core markets which aren’t covered in Sports (or that particular add-on) or that the locations filter automatically updates when an add on data point is added to a crosstab. Let me know if you have any questions. :)



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/locations-filter-should-update-when-using-core-with-add-on)

---

## Export Dashboards in PDF format

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

Client finds that the current Dashboard in PNG format isn’t user friendly for longer Dashboards as each of the chart becomes very small.



He’s asking for the Dashboards to export in PDF format as it breaks down the Dashboards into sections/pages which makes it a lot easier to read and share with his clients.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/export-dashboards-in-pdf-format)

---

## Spark - unable to confirm the data is correct from the insight generated.

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Unable to confirm spark insight is correct as different results generate when I open the insight in chart builder.



I pulled an insight from spark and pinned it, here is the Chat ID:

2079650a-b518-44a3-abbb-31cdd12c4bde

The insight is: Anime viewers in the US are 54% more likely to have purchased a luxury watch brand within the last year compared to the average person.



When I open it in chart builder the results are different. At first I thought it was because the filters were not the same so I adjusted the waves and adjusted the attribute answer options but even after I do that the data does not match.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/spark-unable-to-confirm-the-data-is-correct-from-the)

---

## Mintel just aquired Black Swan

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Tags:** Other

**Feedback:**

“Proud to announce Mintel’s acquisition of Black Swan Data. This is our most ambitious move yet. By combining real-time social prediction with decades of trusted consumer intelligence, fueled by AI and grounded in human expertise, we’re giving brands the foresight to innovate smarter and move faster.“It’s a win for insights, innovation, marketing, and ultimately, the consumer.” Thanks for the vote of confidence, Stephan Gans.”

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/mintel-just-aquired-black-swan)

---

## Audience Building

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

My client wants to inexclude an entire audience to make comparing two audiences easier.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/audience-building)

---

## Export Canvas slides as .jpeg or .png

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Sharing a feedback from client about Canvas.

Other than PDF, they’re looking to see if Canvas slides can be downloaded as .jpeg or .png similar to how Google Slides are able to.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/export-canvas-slides-as-jpeg-or-png)

---

## Improving the display of Datapoint Availability in Charts and Crosstabs

**Status:** In Review
 | **Upvotes:** 6
 | **Board:** 📊 Platform

**Tags:** Spark, Audiences, Crosstabs, Charts, Spark API, Platform API, RMP

**Feedback:**

1. Problem:
Currently, in Charts and Crosstabs, users see an “error triangle: warning” when a datapoint is not available in selected waves or markets. The message typically reads: “Not asked in Q2 2024 in: Country X – Not asked in any of your selected waves in: X, Y, X.” This can result in long, cluttered error messages—especially when listing many markets—and makes it harder to quickly understand actual coverage.

2. Impact:
The current format reduces clarity, especially when working with mutli-market datapoints, and impacts the overall Platform API experience.

3. Business Case:
Removing this barrier will improve the Platform API experience but also allow Spark to easily textualise the data (based on feedback from the Jedi Team).

4. Proposed Solution:

1. Adjust the messaging logic to allow users to switch between not asked and asked depending on which format is more compact and clear. For example: “Asked in: France, Germany, Spain” Or, if applicable: “Asked in: All Markets” 

2. In Charts, show this information in a separate column next to the datapoint name. This brings the context forward.This feature could be linked with the “Datapoint Information” field proposed in this ticket [https://feedback.gwi.com/p/improving-contextual-information-for-datapoints]. If researchers add in wave and market availability there, it could automatically populate this new column.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/improving-the-display-of-datapoint-availability-in-charts-and-crosstabs)

---

## Improving contextual information for datapoints

**Status:** In Review
 | **Upvotes:** 7
 | **Board:** 📊 Platform

**Tags:** Spark, Audiences, Crosstabs, Charts, Spark API, Platform API, RMP

**Feedback:**

1. Problem:
The Global Research team currently writes contextual information —such as markets asked and wave of introduction/removal —within our datapoint names using parentheses (e.g., (Select Markets Only) or (Country A, B & C Only)). While helpful for experienced users of Charts and Crosstabs, this approach creates critical issues in Spark’s search, where these datapoints are currently blacklisted. As a result, users miss out on using multiple datapoints, reducing the value and coverage of the Spark API.

2. Impact:
This affects hundreds of datapoints across our taxonomy, significantly limiting discoverability and usage in Spark. 

3. Business Case:
Removing this barrier will not only give users access to hundreds of datapoints but also help when Spark expands to the other syndicated datasets. Improving this will significantly help facilitate the company goal of getting to 100K monthly active users. 

4. Proposed Solution:

1. Introduce a new field in labels, e.g., “Datapoint Information”, where researchers can input the contextual details currently embedded in parentheses in datapoint name. This information can be displayed in the platform similar to what we have now, but not disturb Spark’s search. In addition, a field like this could also have larger applications and improve the broader experience in the platform. 

1. For example, it could log other contextual information that users can use to sort charts in the platform,such as datapoints types/categories, providing a structured alternative to virtual questions, which are also being blacklisted in spark. For reference: the virtual questions of Websites and Apps questions (q42036a, q42036nn etc.), where we currently organise datapoints by type in different VQs.

2. Alternatively use our existing logic to programmatically show market and wave context in the platform. Since this information already exists, automating its display would resolve the issue while reducing manual work from researchers and potential errors. The most common naming convention are the following: 

1. Markets: if the data applies to up to three markets, we label it as "(Country A, B, and C Only)"; for more than three markets, we use "(Select Markets Only)."

2. Removals: if a datapoint is removed from the survey we label it as (To QX 202Y)



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/improving-contextual-information-for-datapoints)

---

## More helpful and indicative warning information

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Currently when working within Crosstabs (our platform features designed for those wanting to deep dive into a lot of data), depending on the selected data or applied audience, you will see warning signs pop up.



These signs are typically not a clear indication of what actually needs to be reviewed or updated. Especially if you’re working with multiple columns, rows, audiences and attributes. This can result in users thinking there is a bug or issue with the platform when there sometimes isn’t.



It would be good, if we can find a way to clearly indicate to a user what aspect of their crosstab is driving the error warning with either advice on how to resolve it or how to learn from it to adjust their analysis/interpretation.



Below I’m sharing feedback via our partner YouKnow and a frustration their Tier 1 client experience (now this is off the back of a genuine issue of false warnings, but if the above was in place - extra clarity would still mean a better user experience)



“Specifically some users (& my clients) report that they can't work well on Crosstabs because they dont get the correct warnings on many attributes when they see them Q over Q or more importantly market vs market For example think to have 20 markets as columns and many attributes from different questions and not getting the correct warnings is not the best experience and you dont even know if something is not asked somewhere instantly you need to spend time to look for that info. That's the challenge and why my client is asking for when this will be fixed”



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/more-helpful-and-indicative-warning-information)

---

## Linking GWI Spark insights to Crosstabs

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Hey Team,



I was on a client call recently reviewing GWI Spark and they wanted to know if they would be able to, at some point, create a Crosstab from the GWI Spark insights. I know we can currently only view the insight results in charts. Let me know if this is something that is on the roadmap — thank you!



Best,

Juli

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/linking-gwi-spark-insights-to-crosstabs)

---

## Capturing SUSI form fills as HubSpot form fills

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** Business Intelligence

**Tags:** Spark, User Management, Internal Data Flows

**Feedback:**

As a marketing ops lead,
I want form submissions from our app platform (non-HubSpot domain) to be sent to HubSpot using their Forms API,
So that we can capture and report on submission activity with full attribution (UTM parameters, original source, etc.) in HubSpot like we do with native forms.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/capturing-susi-form-fills-as-hubspot-form-fills)

---

## GWI Client Insights

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** Business Intelligence

**Tags:** Business Data Platform

**Feedback:**

Having used client data from their platform engagement to inform team strategies at GWI over the last couple of years, I feel we currently have a blind spot. Mixpanel makes data accessible for data experts, think Product, CS, or those who are data confident and curious. If mass adoption for means getting our data into as many hands as possible, should we not want GWI’ers to have self-serve insights to see what our clients use our data for?

Having a natural language tool on front of platform usage data would mean we’re much better informed as an organisation at what people are actually using the data for. Let’s say you’re about to go into a call with a client and want to know what their organisation’s strategic priorities are, if you could analyse the questions they’ve engaged with and their platform search history through a simple search and get a response, you’re going in to that call much better prepared. This is just one example, as the use cases are many.

You can already do proof of concepts through exporting Mixpanel charts and uploading them into AI tools like NotebookLM and providing the sheet is formatted appropriately, you can see what’s happening with a client, an industry, or what’s changing across all clients. Think somewhere between Google Trends and a BI tool.



Happy to discuss this one with whoever picks it up as I’ve got a proposal deck built already.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-client-insights)

---

## Dashboards - mass 'sort by'

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

It would be a huge time-saver if there were an option to ‘sort by descending’ across all charts in a dashboard at once, rather than having to apply it individually to each one.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dashboards-mass-sort-by)

---

## All users synced into HubSpot

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** Business Intelligence

**Feedback:**

We’d like all users from UM in HubSpot, not just new Free plan users and existing matches. This required upserting existing users to HubSpot, and all new users going forward.

We’d use this data in marketing to improve our nurturing and campaign targeting.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/all-users-synced-into-hubspot)

---

## Shared Dashboard editing rights.

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

My client has come to me with the following issue:



* Some challenges we are seeing is that only the owner of the dashboard can make changes it would be ideal to have shared rights for that. Also, when downloading different views, different tabs are created. Creating a unique database is a bit challenging.

I responded with the following:



Regarding the challenge with the shared dashboard editing, what can be done is to click on 'save as new' at the top make changes, save and reshare. Using a naming convention like V1, V2 etc.



Is this something on the roadmap or will it remain that only the owner of a shared dashboard can make direct edits, with other users needing to save as new?



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/shared-dashboard-editing-rights)

---

## PLG > SLG upgrade: End to end funnel metrics

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** Business Intelligence

**Feedback:**

Ruan and I have been speaking with @Maria Gray [https://globalwebindex.slack.com/team/U05RPHYM1CG] from the website team to get some visibility on what proportion of people who click the book a demo button in the platform (tracked in Mixpanel) then actually book a demo via the website form for the corresponding landing page they get routed to (tracked by Google Analytics).

What we'd love is the ability to see a full funnel showing:

1. User clicks one of the upgrade/book a demo buttons in the platform from one of the splash screen pages or the plans page

2. They land on the corresponding website page, which has some more info and the form to book a demo.

3. They fill out the form to schedule a demo with a member of our sales team.

4. Demo is then sat/attended.

5. They then sign a pro or plus_enterprise SLG deal.



We have visibility on 1 from mixpanel [https://mixpanel.com/s/1wvYAp]
We have visibility on 2 and 3 from google analytics (here are some of the numbers Maria as pulled for 27th March-30th April).



But we’re missing visibility on 4 and 5, and we’re unable to connect the journeys together. For example, it’d be very interesting to see if those who book a demo from the crosstabs flow convert to pro better than those who book a demo for the dashboards.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/plg-greater-slg-upgrade-end-to-end-funnel-metrics)

---

## Intercom Data Feed Clean-up

**Status:** In Progress
 | **Upvotes:** 3
 | **Board:** Business Intelligence

**Tags:** Business Data Platform, Internal Data Flows

**Feedback:**

* Clean outdated/duplicate data (possible GDPR implications) - The current problem: The Intercom data is very outdated. There are lots of users who are still in the Intercom but have been deleted from the UM.

* Align and improve the live data scrape alongside existing BDP data flow - Finance data, payment data, etc

* Review data effectiveness to support use cases like Chatbot performance and cross-team needs



Creation of a mechanism that automatically syncs UM and intercom records to make sure we don't have this problem in the future.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/intercom-data-feed-clean-up)

---

## Capital Allocation Report

**Status:** In Progress
 | **Upvotes:** 4
 | **Board:** Business Intelligence

**Tags:** Business Data Platform, Internal Data Flows

**Feedback:**

Currently there’s a semi-automated process run by me, that creates a monthly report for work that’s relevant for CAPEX.

I believe that BI are able to do a much better job than me.

Please find a description of the process here:

https://docs.google.com/document/d/1A6it4q1v0M3ikHi-bb2iApGUJFouiP8cBHz2hqHa9Ms/edit?tab=t.0 [https://docs.google.com/document/d/1A6it4q1v0M3ikHi-bb2iApGUJFouiP8cBHz2hqHa9Ms/edit?tab=t.0]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/capital-allocation-report)

---

## Comparing add-on datasets respondents against gen pop

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts, Crosstabs, Dashboards

**Feedback:**

When using our add-on datasets, users aren’t able to understand how those behaviours compare to the general population - only their respective base audience e.g sports fans / gamers etc.

It would be really useful to add the ability to change the base audience to gen pop when using the add-on datasets.



e.g using GWI Sports - building a GWI Sports audience but rebasing the base audience to be gen pop and NOT sports fans.



They mentioned this is a real drawback of the add-on datasets because you never just need to understand how that relates to a subset audience. It’s key to identify whether that differs from the general population or not.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/comparing-add-on-datasets-respondents-against-gen-pop)

---

## Enterprise Collaboration Experience

**Status:** In Progress
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

For Enterprise clients like Meta, the removal of the view-only alongside Share & Invite functionality has left their teams unable to share content across their wider organisation.



To support strategic sharing of GWI content and insights it would be good to have some sharing capability that enables a client’s specific use case of data & insights to be shared in the format they would like this to be shared.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enterprise-collaboration-experience)

---

## Canvas - Option to choose relevant slides

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Once you’ve done a prompt and selected a use case it might be a good idea to take the user to another page where they can tick a certain number of slides. Some of the slides/insights that automatically pull through might not be relevant. If there are a set 30 or 50 options and they can select the most appropriate 10 or 15 (however many we choose) then it could make the experience and output more personalised.

Could also help PLG by gating the option to select personalised slides or even how many slides they can select. E.g free version is 3 slides, Plus is 10 and Pro is 20

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/canvas-option-to-choose-relevant-slides)

---

## Canvas - Audience same size

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

Ability to see sample sizes of audiences that you’ve prompted to understand feasibility. Potentially highlight with a message if sample size is too low?

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/canvas)

---

## Data set included in crosstab data point overview

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hey team, Since moving all our data sets into the same namespace, I find it challenging to understand which data point came from which data set when added to a crosstab. Especially if you revisit a crosstab after a few days or you do some analysis between Core sports question and GWI Sports, it’s very hard to distinguish where that data point came from. I do rename data points myself after I added them but I think it would be great if there would be a little note from which data set that data point came from.



PS - I renamed Column B and C myself in the screenshots.



Thanks :)





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/data-set-included-in-crosstab-data-point-overview)

---

## Custom Qualifying Questions Landing Page

**Status:** In Review
 | **Upvotes:** 0
 | **Board:** 📊 Platform

**Tags:** Audiences, Homepage

**Feedback:**

1. Clients don’t know about our custom capabilities

2. The process includes multiple handoffs from CS→AM’s. Basic qualifying questions (i.e. how many markets; LOI, etc.) are done via email.

3. Embedding a custom landing page in the platform. So whenever, audience sample is too low and turns red, we offer a link to explore custom. Responses get directed to either AM or GWI custom teams to build out feasibility estimates.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/custom-qualifying-questions-landing-page-2)

---

## Custom Qualifying Questions Landing Page

**Status:** Future consideration
 | **Upvotes:** 0
 | **Board:** 📊 Platform

**Feedback:**

1. Clients don’t know about our custom capabilities

2. The process includes multiple handoffs from CS→AM’s. Basic qualifying questions (i.e. how many markets; LOI, etc.) are done via email.

3. Embedding a custom landing page in the platform. So whenever, audience sample is too low and turns red, we offer a link to explore custom. Responses get directed to either AM or GWI custom teams to build out feasibility estimates.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/custom-qualifying-questions-landing-page)

---

## Spark - Need to understand what data is available in order to use it

**Status:** In Progress
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark, Audiences

**Feedback:**

A user at amazon studios said that Spark is a really cool idea but in order to be able to use it you really need to know what data is available and how our questions are worded. For example - Amazon would want to understand Amazon Prime Video subscribers which is not an attribute we track so instead they would need to know to search for Amazon Prime Video Engagers.





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/spark-need-to-understand-what-data-is-available-in-order)

---

## Title of Datasets in Excel Exports

**Status:** Planned
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts, Crosstabs

**Feedback:**

Hi Team,

Our clients at TBWA have a massive custom study they do every year called "Edges." They want to be able to see the year of the report in the source section of the exports in excel from charts and crosstabs.

Screenshot attached

Screenshot 1: Right now it just says Source: GWI

Can this say Source: GWI Custom Study: Edges AI 2025 similar to what shows when you're on the platform:

Screenshot 2



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/title-of-datasets-in-excel-exports)

---

## Calculate Averages in Spark

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Hi Team,



Currently Spark does not have the capability to calculate average. It would be great if when entering a prompt like the below for Spark to give the average age, income, and media consumption averages like we can in crosstabs

* What is the average age of the U.S. Mobile Gamers?



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/calculate-averages-in-spark)

---

## GWI Spark unable to pick up Personas

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Asked “What personas do we have among Gen Zs in India?” but GWI Spark generated insights that’s not relevant such as education level.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-spark-unable-to-pick-up-personas)

---

## Powerpoint Canvas exports

**Status:** Future consideration
 | **Upvotes:** 6
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

I love that we can export this into PDF, but wondering if there’s a plan to have PowerPoint exports. I could see clients wanting to take this data and put it into their client’s color, etc.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/powerpoint-canvas-exports)

---

## Canvas feedback

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

I’ve been playing around with Canvas and have noticed that the report output, while focusing on the Gen Z audience, doesn’t actually include any of the stats or data from the Spark output (image attached - for example anything relating to body image, appearance, anxiety etc). The report is more of a general overview of Gen Z. Thinking of this from a user’s perspective, this could be frustrating as I would probably expect the stats in front of me to be the ones that come out in the report.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/canvas-feedback)

---

## Audience limitations on GWI Canvas

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

In testing the new GWI Canvas feature, I realized you have to isolate 3 audiences to be able to click on the “Build Report” button. It would be helpful to adjust the current requirement of isolating to exactly three audiences. Users may not intuitively know this limitation, and broader questions (for example “Which generations use Disney+?” resulted in no GWI Canvas) can’t be addressed due to the constraint. Expanding the functionality to allow for one, two, or more than three audiences would make the tool much more flexible. This would be more in line with Commercial Closers and non-researchers which this tool was created for. For example, I had to adjust my prompt to specify exactly three audiences in order to use GWI Canvas, which felt a bit restrictive. Thank you!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/audience-limitations-on-gwi-canvas)

---

## Canvas Colors

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Canvas

**Feedback:**

The ability to customize the colors in the V=Canvas reports

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/canvas-colors)

---

## Weighting information getting lost

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Whenever there are changes in cleaning profiles or namespaces for which the processing configuration processes the data, the weighting code is lost, which is time consuming and making room for errors that might not be caught in time.

One case where this happens mostly is when we’re asked to create a separate cleaning profile from the one that fieldwork is using (to make sure none of these changes are affecting quotas or fieldwork expected behaviour), to introduce new information or cleaning rules that will have to be used in processing. Whenever this happens, we need to change the cleaning profile from the processing configuration’s landing page and that’s the moment when the weight code is lost. For syndicated projects this is even worse as the weights are done using Tonnage Builder so it’s impossible to copy the code from a previous version, creating the perfect set up for making mistakes. This affects all Data Team members (can’t speak for other departments), and all projects processed via RMP.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/weighting-information-getting-lost)

---

## Bulk Move Rows/Columns in Crosstabs

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hi Team,



Beam Suntory is looking to be able to bulk drag and drop rows/columns in a crosstab

For example when adding new attributes to a crosstab it is added at the bottom of the sheet, they would like an easier way to move multiple cells and reorganize the crosstab



Drag & Drop in XB for bulk items - ie, moving multiple cells from a single question to a higher position in a row at a time



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/bulk-move-rowscolumns-in-crosstabs)

---

## Automatic matching of USA Recontact completes to USA Main

**Status:** In Review
 | **Upvotes:** 4
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Currently the matching for USA Recontact has to be manually run each week by a member of the data team. This gives us limited visibility on progress, any fieldwork issues, quality fails, and can hinder things like data checking etc. I know that Core Recontact does the matching automatically and has done for a long time, hoping we will be able to do something similar for USA.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/automatic-matching-of-usa-recontact-completes-to-usa-main)

---

## User guidance when Spark cannot generate an insight

**Status:** In Review
 | **Upvotes:** 0
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

We recently had 2 instances where a user sent a prompt and Spark used a legacy data point to build the audience. As the user did not define a timeframe, the last 4 waves were used and as a result, there was no sample size, therefore did not load any insights. While this is expected behavior for Spark, it is not the best user experience since they would not know about survey changes or the metadata.

Potential solutions could include:

* Spark utilizing metadata to advise the user to define the specific timeframe OR

* Spark automatically selects the correct waves for the chosen data points

* Prevent Spark from using legacy data points out side of the latest 4 waves



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/user-guidance-when-spark-cannot-generate-an-insight)

---

## Customisable Audience Instant Insights

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences, Canvas

**Feedback:**

Just Eat has requested for the Instant Insights cards in Audiences to be customisable so they are able to update it with their questions and change the default metric.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/customisable-audience-instant-insights)

---

## User built Audiences pulling in GWI Spark searches

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

User: jennifer.martin@trueglobalintelligence.com [jennifer.martin@trueglobalintelligence.com]



User reached out because she wanted clarity on:

1. How her own audiences were being pulled into GWI Spark, she tried to do a general Doctors audience, and it automatically brought up a Novo Nordisk audience she created in the past



2. She wanted to know why GWI Spark chose this exact audience when she was looking for general doctor insights. The question submitted to GWI Spark was: How do doctors use Facebook?

I imitated the account and can confirm this occurred.



Is GWI Spark now pulling through user built audiences going forward?



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/user-built-audiences-pulling-in-gwi-spark-searches)

---

## Idea 💡

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Feedback:**

I would love to see the sidebar collapsable in Free and Plus, so that the main part of the platform can be larger ✨ Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/idea-bulb)

---

## Ability to filter users by Name in admin

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

THE PROBLEM

the problem is that we can no longer look up users from Publicis in admin. the users are set up with internal domains (e.g. vintiepp@publicisgroupe.net [vintiepp@publicisgroupe.net]) as their login. this person's name is Vinicius Tieppo. and when they email us, their email is vinicius.tieppo@publicismedia.com [vinicius.tieppo@publicismedia.com]. so we can't locate them by their email, and it would be helpful if we could filter in admin by name.




THE IMPACT

it would be a game-changer because as Publicis is our biggest client and has over 3,000 users, having to refer to our large scale usage sheet every single time a user comes in to check their access is a major roadblock. we now have an admin system that doesn't allow us to locate our users. if 'name' was added as a filter as shown in my screenshot, it would fix the problem.




IMPACTED USERS

GWI customer success on Publicis is impacted by the problem.




SOLUTION SUGGESTION

suggestion is to add the 'name' filter to admin so we can locate our users





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ability-to-filter-users-by-name-in-admin)

---

## Ability for Spark to build target audiences from prompts

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Ability for Spark to build target audiences from prompts



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ability-for-spark-to-build-target-audiences-from-prompts)

---

## Bank institutions in Greece

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Our partner has advised that in our Core survey we include 'Bank of Greece' among Bank institutions in Greece and clarified that they are not a commercial bank with clients, just the central bank of Greece



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/bank-institutions-in-greece)

---

## Crosstabs templates

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hilton has requested the addition of pre-made crosstabs of average calculations that are available, specifically for the TSOM questions.

It is very consuming creating these templates and especially now with the new TSOM questions, but they would also like to see all the average calculators in one place so they can easily view all that’s available rather than having to navigate folder by folder to find all the average calculators we have.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/crosstabs-templates)

---

## Removal of Personas and Location Data from Instant Insights

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

It is hard to explain around personas and location when reviewing instant insights with prospect. The personas are usually not tied to the audiences (e.g. Gig Workers who drink tea, Gamers who are interested in purchasing a Ford) and the location will always default in Core to China or if in USA to California.



As the personas are not mutually exclusive, it can be confusing how the data justifies the persona. For example, why are small business owners “Daredevils”? It is hard to explain this during a demo and often the prospect sticks on this longer than needed. This is not beneficial to prospects that don't need location data for their planning purposes and it such a broad stroke here that it gets lost when we show them our localized data later on.



Each example can sow distrust in our data and I have experience where it even lost a few deals. I ask these be removed from the instant insights cards and subsequent dashboard view.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/removal-of-personas-and-location-data-from-instant-insights)

---

## Can GWI Spark create audiences for clients?

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark, Audiences

**Feedback:**

Hi, just an idea, client has asked whether GWI Spark can create audiences for them using multiple attributes or variables. If they’re listing an audience who’s Female, 25 - 30, who’s high income, who’s interested in cars, and looking to purchase one.



Would this be something that GWI Spark can do in the future?

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/can-gwi-spark-create-audiences-for-clients)

---

## Allow exporting of charts in vertical style

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Right now you can only export a chart in PNG or PDF in the horizontal style, but it would be helpful to be able to export into vertical as well so clients can configure the chart the way they would prefer.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/allow-exporting-of-charts-in-vertical-style)

---

## Editing Chart Display in GWI Spark Results to Overlay Different Audience

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Hey Team,



I was just on a client call reviewing GWI Spark and they wanted to know if there's any way after getting a specific insight and clicking into it, to be able to then overlay a different audience. For example, they started off the question with trying to understand female respondents making food decisions for their household but when clicking into the insight and previewing the chart, they then want to see what that looks like for Pinterest users. Outside of asking the question once again and indicating that they want to look at what the food decisions look like for female Pinterest users, is there any way to be able to edit the chart in the future by overlaying a different audience?



Thank you and let me know if you have any questions!



Best,

Juli

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/editing-chart-display-in-gwi-spark-results-to-overlay-different)

---

## DSL commands fail silently

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

In the bespoke processing stages, DSL commands fail silently if for example a variable is missing, resulting to some transformations or variable creations never taking place. It would be very helpful in the debugging process if such errors were captured and logged.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dsl-commands-fail-silently)

---

## GWI Data learning for Spark users

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

Spark is primarily intended for non expert users of GWI. This means that these potential users will know the least about GWI data which is a problem. So if we’re successful with getting hundreds of thousands of people to try Spark…the failure rate will be huge simply because they don’t know what’s in our data within Spark. These people will obviously then not come back to Spark or become active users of it.



One fairly simple/straightforward partial solution could be to simply include this link:

https://www.gwi.com/data-coverage [https://www.gwi.com/data-coverage]. Or it could be some re-imagined version of that link that’s specific to Spark. It’s super useful today…we just need some sort of way to put this in front of spark users…before they use Spark.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-data-learning-for-spark-users)

---

## Auto-Rebase Duplicate Charts

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Currently, if you duplicate a chart it duplicates everything (audiences, segments, etc.), except for any rebases. Instead, it automatically defaults to the standard dataset base.

The SI team (and I’m sure others do this too) often creates charts both in internal & client orgs, and more often than not if we’re duplicating a chart we’re hoping to duplicate everything - including the rebase.

If the rebase isn’t carried over in the duplicate and it goes unnoticed (e.g. by a client who may not be a platform expert), this could potentially lead to incorrect data analysis. It would be great if this tweak could be made - both so that we don’t need to repeatedly go in and update the rebase in duplicates, and also to reduce the risk of client platform/data errors.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/auto-rebase-duplicate-charts)

---

## Spark Only Users + Dashboard Sharing

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Spark, Other

**Feedback:**

As we continue to enable Spark for existing customers/users, what happens in a scenario where a PRO User “Share & Invite”’s a free/spark only user?





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/spark-only-users-dashboard-sharing)

---

## Expand insights into charts/ Dashboards

**Status:** Planned
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards, Charts

**Feedback:**

Extract deeper insights from Spark and integrate them into other areas of the platform, including charts and dashboards.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/expand-insights-into-charts-dashboards)

---

## Use of own audiences with GWI Spark

**Status:** Planned
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Spark

**Feedback:**

A user has given some feedback re GWI Spark, suggesting that it would be useful if they were able to use their own audience

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/use-of-own-audiences-with-gwi-spark)

---

## RMP margin on Processing > Transformations Tab

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📈 Data Foundations [INTERNAL]

**Tags:** Dashboards

**Feedback:**

Hi there. I am in the Data Analytics Engineering team. I use RMP every day, and I have spotted a minor pain point that seems very easy to fix. When I am adding code to the Bespoke Script - End block at the bottom of the page, It would be really helpful if there was a little margin under the box or padding in the main window. I often need to add several lines of code and to see it properly; I need to expand the box. However, because the box is flush to the bottom of the page, it doesn’t allow me to do so without shrinking the whole window and dragging it > scrolling down, dragging it again > repeating.

I have managed to fix the issue by adding padding to the window that holds the bespoke Script End block in the developer tools, and it works great. It feels like a simple front-end fix.

Thanks for listening
Regards
Peter Faretra



[https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/01954186-ffac-7bf5-b864-4944c08dbca2.png]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/rmp-margin-on-processing-greater-transformations-tab)

---

## Visualization of Multiple Datapoints in Dashboard

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

Hi Team,



In many of GWI’s reports Indexes and "% of" used in the same chart. I think this approach is a great way to present a more complete story with the data.

We’d love to replicate a similar method in our own reporting within the dashboard functionality



[https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/019539c3-24e8-7aa7-814c-75bf2a2c720c.png][https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/019539c2-c387-7cd5-975a-32121c6df795.png]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/visualization-of-multiple-datapoints-in-dashboard)

---

## Multi share

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Dashboards, Crosstabs, Audiences, Charts

**Feedback:**

Hello! Please can we add in a multi-share for any created charts, audiences etc? A client has asked for this and I know it’s been asked before so wanted to bring it to your attention again.



Thanks

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/multi-share)

---

## Grouping in Crosstabs

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Are we able to add groupings into a crosstab? For example, if you have demographics, brand discovery and media consumption they are three very separate subjects but will all be displayed in one crosstab and you can only sort in a few ways.



Would it be possible to group these into three sections within one crosstab and sort accordingly? So instead of having to make three separate crosstabs this can be in one crosstab but with ‘sections’.



Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/grouping-in-crosstabs)

---

## Default Base in Crosstabs

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Problem: Clients would like to hop into their Crosstab and have their custom base automatically viewed instead of defaulting to “All Internet Users.”



Many clients wish to see the view since their main reason for creating a new base is to understand their new base and not “All Internet Users.”



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/default-base-in-crosstabs)

---

## Brand Trackers Work in Unison

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Other

**Feedback:**

The idea is to have custom brand trackers work similar to how different waves of Core, USA, Sports, etc. work where you can use multiple waves of the same questions in one view.

1. When using multiple waves of a brand tracker, it is cumbersome to see wave on wave changes, not possible to use waves together to increase their sample sizes, etc.

2. Any client that uses the same brand tracker multiple times.

3. HarperCollins has informed us they will no longer run their brand tracker or subscribe to GWI if they can not look at the data in a cleaner way.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/brand-trackers-work-in-unison)

---

## Geograpical Heat Map

**Status:** In Review
 | **Upvotes:** 7
 | **Board:** 📊 Platform

**Tags:** Other

**Feedback:**

Disney wants to be able to create geographical heatmaps of the US when telling stories and creating visual narratives. Currently the only tool that does this is MRI which is the tool they rely on most. If we can add a Geographical Heat Map to GWI USA or even GWI Core that you can customize colors that would give us a one up on our competitor. Disney uses this heatmap in over 200+ projects a year. Currently MRI does not allow for color customization so if we could not only add the geo heat map but also allow for color customization that would be a huge win

[https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/0194e0dd-f27d-7d28-a3dc-a2a1db1a5560.png]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/geograpical-heat-map)

---

## Change Tracker, "Detail" field character limit.

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Is it possible to increase the character limit as currently we cannot see the full text and verify the change.

[https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/0194d58d-ffd0-7c7e-bdf2-4f546380b309.png]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/change-tracker-detail-field-character-limit)

---

## Enable users to see non-rounded column and row percentages in crosstabs

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

A user has complained that the index figure the platform gives him is different to the figure he gets when he manually calculates the index. The calculation he is using is:



INDEX = Audience col% / Totals col% * 100



What I’m suggesting (and I obviously don’t know the feasibility of this!) but is if it would be possible to click on the column/ row percentage and be able to see the non rounded figure ie 1.60237. And if the platform were to use the non rounded figure when doing the calculation so the manual calculation = the automatic platform calculation.



Crosstabs is obviously positioned as the part of the tool for the ‘data expert’ so in my view while you wouldn’t necessarily want to enable this everywhere it might be something to consider for crosstabs when a data person wants to be really specific.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-users-to-see-non-rounded-column-and-row-percentages)

---

## Enable removing shared audiences/charts/dashboards/crosstabs from users' view or enable moving these to a separate folder

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards, Crosstabs, Audiences, Charts

**Feedback:**

Hi team,



Could you enable the option to remove shared audiences, charts, dashboards, or crosstabs from a user’s view or allow these items to be moved to a separate folder? This is critical for GDPR compliance, as shared items display users’ email addresses, which could be exposed during client demos or when clients share their screens.



Thanks!

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-removing-shared-audienceschartsdashboardscrosstabs-from-users-view-or-enable-moving)

---

## Enable copy/paste and/or section selection download of Crosstabs

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Hi team,



Our client wants to be able to easily copy and paste a selected section of the crosstabs, or to at least be able to download a selected section of the crosstabs rather than having to download the whole crosstab.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/enable-copypaste-andor-section-selection-download-of-crosstabs)

---

## OR Attributes in Charts

**Status:** In Review
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

1. Within Charts, there is no ability to AND or OR attributes. This limits the ability to leverage Dashboards since it is the only tool that can populate in a Dashboard.

2. This would dramatically help enterprise accounts that utilize Dashboards to share insights with their sales / marketing teams.

3. This has come up multiple times with clients. The most recent example is being able to OR several ethnicities to create a “minority” attribute. There are 9 ethnicities/races in GWI USA and the client wants to see two attributes in Dashboards, caucasian and minority. The idea is that the Insight Gurus create these custom Dashboards for their Commercial Closers.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/or-attributes-in-charts)

---

## Average Calculator for Charts & Dashboards

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Dashboards, Charts

**Feedback:**

1. The problem is that there is no quick way to show the averages in Dashboards

2. Anyone that uses Dashboards

3. Insight gurus want to create templates for their commercial closers without getting tons of requests and having to break down data for them. Larger corporations that own several companies want to arm their commercial closers / sales / marketing teams to have personas for their various brands. Conde Nast recently noted that this feature would allow them to operate at scale and be a key feature to allow them to switch from MRI to GWI. In terms of ROI, for this client alone, it would be around $700k in year 1 but would also convince other clients in this space to do the same.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/average-calculator-for-charts-and-dashboards)

---

## Ascending/Descending data on Totals column

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

When looking at data for example brand penetrations in certain markets, you are unable to sort the data on the totals column, instead even if your location is already set to the market you want, you have to add in the market again in your column and sort based on that, in essence just duplicating what you are already seeing

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/ascendingdescending-data-on-totals-column)

---

## GWI Spark for Crosstabs

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs, Charts

**Feedback:**

I had a meeting with an EVP of strategy and innovation from an agency recently. Wide ranging conversation on AI and one of the things I learned is that they are taking crosstabs and putting them into the AI tool Claude. They put it into Claude specifically to have Claude find the most interesting and relevant insights. Sound familiar?



So this is both a problem and an opportunity. The problem is that customers will increasingly do this sort of thing which basically means they are leaving our platform to create their insights.



The opportunity is to simply build a feature in our crosstabs and charts that would automatically apply GWI Spark to that crosstab or chart build.



This would then apply GWI Spark value to existing users instead of solely focusing on non-research professionals. Equally, it will keep users in our platform, increase active usage rates, etc. Perhaps this is already in scope for Stories but thought I would submit if not.









**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/gwi-spark-for-crosstabs)

---

## Feature request on behalf of client (Somin)

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 🔗 API

**Feedback:**

Hi, account Somin Pte Ltd who is a current API client of ours had this question below which he shared with our product team:



"is there any field on either datapoint or question that labels which country the question is available in?"



Manos explained to him that currently, metadata information both for questions and datapoints are not available in neither V2 API nor V1 API. He also suggested for this feature request to be submitted in order for it to be evaluated by the engineering team and potentially add it to our API.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/feature-request-on-behalf-of-client-somin)

---

## Z Score/Stat Sig vs Index

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Calculations, Crosstabs, Other

**Feedback:**

Amazon Studios asked if we have Z Scores as this is the metric they are using more than index scores. They seemed to indicate that it’s more of an industry standard for their research and insights.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/z-scorestat-sig-vs-index)

---

## Quota search reset

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Is it possible that when we make a change a quota, the search doesn’t reset? We often need to do several edits on the same set of quotas and when it resets every time it can be frustrating

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/quota-search-reset)

---

## Data/Audience Control for Insight/Research teams to Sales teams

**Status:** In Review
 | **Upvotes:** 0
 | **Board:** 📊 Platform

**Tags:** Audiences, Spark

**Feedback:**

A very common scenario within businesses is that the research/insights teams control the audiences and charts/dashboards that sales teams can use to make sure that any data used is not wildly different amongst sales reps. Dashboard only users can only use Audiences shared with them within dashboards specially designed for them. While we don’t want to restrict the data accessible, it would be beneficial to make sure that audiences added can be controlled if sales teams are thought of for this product. This would make it easier for insight/research teams to buy into the idea of rolling this out to sales teams to use with confidence.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dataaudience-control-for-insightresearch-teams-to-sales-teams)

---

## Introduce Macro Adjustments for Dashboard Metics

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

client has shared a suggestion they think will improve efficiencies while navigating data in dashboards:

Consider adding a 'macro changes' feature to dashboards, allowing users to apply a default metrics across all charts on a dashboard. For instance, enabling all charts to sort by highest-to-lowest index by default and setting all charts to display 10 rows instead of 5 with a single action. In short, an ‘apply to all’ function when sorting/selecting metrics view for charts in a dashboard.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/introduce-macro-adjustments-for-dashboard-metics)

---

## Add the toggle feature in audience builder

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

It would be great to be able to use the ‘toggle’ feature when building audiences. This would be very helpful if you’re building an audience using specific markets and being able to filter to data points only asked within the selected markets.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-the-toggle-feature-in-audience-builder)

---

## New feature to automatically save crosstabs

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

When working on larger and complex crosstabs especially, one wrong swipe on the mouse trackpad can delete your entire crosstab! Could there be a feature that automatically saves your crosstab as you work on it just like in dashboards?

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/new-feature-to-automatically-save-crosstabs)

---

## Add more Segment options in Charts for Add-On Datasets

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Hey team,

Was curious what the intended behavior was for the Segment tool in Charts for various add on datasets? In this video [https://www.loom.com/share/41b3e87ad4fd49c3a3ea1eb3251a1f64?sid=ce53e215-3e7c-4f7e-b4cc-513c1bc69898]you'll notice that there aren't nearly as many Segment options. I know that GWI Moments is only available in the US so we can't segment by world regions but there are a few missing that can be helpful to clients.

For example, the client Walmart, wants to be able to use segment by urban context, income brackets, and children using the add on datasets to prove some of their narratives. A temporary work around can be creating several audiences to address this but hoping to have this as a feature that all clients can benefit from.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-more-segment-options-in-charts-for-add-on-datasets)

---

## Combining Attributes Across Questions for Advanced Audience Building

**Status:** Future consideration
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

Client is requesting the ability to combine attributes from multiple questions (e.g., Apparel Purchase Drivers and Online Purchase Influencers GWI USA) into a single audience group. They want to create a group where agreement with any two attributes out of a selected set (from 4 or 5 different questions) is required. This would allow more flexible and complex audience-building.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/combining-attributes-across-questions-for-advanced-audience-building)

---

## Using Automation / AI to Create Audiences

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

The problem you and your client has encountered

* the Instant Insights tool is very useful in creating a chart quickly to find insights but creating audiences, especially a more complicated one, can still be a time consuming task

* It would be great if automation / AI can help create audiences, similar to requesting an instant insight. So a input tool where you can ask to create an audience based on your requested features / attributes (e.g. create me an audience for young men who are using social media regularly)

How many users this impacts / scale of the problem

* Anyone who uses the platform but would useful to a platform user who wants a quick insight or less experienced user

Business Case, if applicable (can you link the idea directly to ROI)

* While our audiences tool is very user friendly, it leans toward users who have a strong sense of boolean logic or survey experience.  This will allow users of any experience to leverage the most out of our audiences builder tool

* This would take out some of the guess work when creating an audience (e.g. finding a question related to a feature you might want in the audience in our surveys). It would theoretically help find the closest match for you and help enhance audience as a tool to complement charts.



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/using-automation-ai-to-create-audiences)

---

## Add venn diagrams to show overlap on multiple audiences

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

My client Anomaly (contract value $150,000) have requested more visuals on the platform. They are big crosstab users and love the heat map functionality to gauge how 2 audiences/ data points overlap and intersect but would love a data visual such as a venn diagram to see how multiple audiences overlap.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/add-venn-diagrams-to-show-overlap-on-multiple-audiences)

---

## Dashboard Visual Export - PNG

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

WHAT

A visual export for dashboards.



WHY

We believe that this initiative will improve dashboard & platform retention and bring GWI up to industry standard for exporting



FAQ: https://docs.google.com/document/d/1oIHLjY-sJ9SQz8MuA9k3iLeK5N60I35tQuMyC8vaHgs/edit#heading=h.jxx4o5tswkd2 [https://docs.google.com/document/d/1oIHLjY-sJ9SQz8MuA9k3iLeK5N60I35tQuMyC8vaHgs/edit#heading=h.jxx4o5tswkd2]



DEMO: https://www.loom.com/share/b371fe2c8e4f4bab9cfda327209b89cc [https://www.loom.com/share/b371fe2c8e4f4bab9cfda327209b89cc]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dashboard-visual-export-png)

---

## Automating questionnaire and brand list creation from labels

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📈 Data Foundations [INTERNAL]

**Feedback:**

Hi there, I wanted to resurface an idea I previously submitted on Aha (IDEAS-I-334). Our survey teams currently update the client-friendly questionnaire documents manually with each release (example here [https://drive.google.com/file/d/1PD5781GL3nhW4N2S-nE9LOuakT_IaB0h/view?usp=sharing]), which is quite time-consuming and prone to human error. I think we could automate this by downloading the list of questions and options from labels each wave.


This automation could also help bring back the client friendly list of brands covered in Core [https://drive.google.com/file/d/1jHHqDtocyvDkzK11sr5Sih8jDGhNEjsY/view?usp=sharing], another doc that the survey team used to manually update each quarter and was discontinued it due to the manual process. Since the Revenue teams still request this document, finding a more efficient way to reintroduce it would be really helpful.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/automating-questionnaire-and-brand-list-creation-from-labels)

---

## Making Question Charts Searchable When Building Dashboards

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

Hey Team,



I was on a call with a client recently and they lamented not being able to search by keywords when using question charts. They mentioned that they’re not well versed in where to find questions so they wish they could search by keywords when trying to add question charts. Is this something that could be feasible?



Best,

Juli

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/making-question-charts-searchable-when-building-dashboards)

---

## Command F on crosstabs to quickly find datapoints on large data tables

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

Lagardére (client value of £75K) mostly use crosstabs and requested a “find” feature to easily locate datapoints in large data tables.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/command-f-on-crosstabs-to-quickly-find-datapoints-on-large)

---

## Adding Full Question in Crosstabs

**Status:** Completed
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**


The client relayed this feedback: “Is there a way to have the rows/attributes include the actual question wording, instead of a general descriptor? Since I want to refer back to these crosstabs at a later date, it'd be helpful to easily get the context on the question.”

To summarize, it would be great to include the full question in Crosstabs as the attribute naming convention may not be as straightforward to some users.


**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/adding-full-question-in-crosstabs)

---

## Distinguishing between shown but not selected datapoints and not shown datapoints (underpinned by automatic rebasing))

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Calculations, Charts, Crosstabs

**Feedback:**

What:

Currently, for datapoints that appear blank in the platform, we are unable to tell they were asked to respondents but not selected by any of them or just not asked to respondents. I believe this is due to both being coded as “0” in the data files rather than blanks for datapoints that were not asked and 0s for datapoints that were not selected. This is highlighted by the attribute warnings on the platform always stating that the datapoint “Not asked” in a certain market regardless of whether that is the case or not.



Who:

Any client who has commissioned a brand measure / tracker in which there are brands shown to only a segment of the sample (i.e. different brands per market). Recent examples include Publicis’ Brand Compass study ($650k), Ecco’s shoe brand tracker (€340k), and P&G’s multi market manufacturing workers study.



Why:

Outlined in this document [https://docs.google.com/document/d/1xhWYUi7n_SxGa3mS2IBplJ5SUtXFJj9-1xP-aWprZdk/edit#heading=h.5ha8bmv0fd41] as well as some suggested solutions.

It can lead to missed insights and incorrect insights which impact the value that clients can derive from our studies.



I would like to add that I appreciate this is a huge ask, however, it would be a massive improvement to the platform and is something that has been directly requested by many high-value clients. Members of the research teams would also save countless hours by not having to manually apply base audiences to questions that were only asked to subsets of the sample.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/distinguishing-between-shown-but-not-selected-datapoints-and-not-shown)

---

## Additional mandatory fields for user creation in Admin

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

Request 1:

1. Add the following as additional mandatory fields to be completed when setting up new users (all needed at user level):

> a. CX owner (already exists as a field on user level)

> b. SalesForce account ID (already exists as a field but at Org level)

> c. SalesForce contract ID (does not yet exist)

> d. SalesForce contract team (does not yet exist)


Context:

We are launching a new CS tool (Hook) to help enable more automation, efficiencies, better tracking, and more. As part of this, we are implementing data from sources such as Admin, Salesforce, Intercom, etc. and the above fields will help us to automatically match user data to contractual data, in order to properly utilise Hook.



Request 2:

2. Add the ability to bulk edit all of the above fields - i.e. similar to how we can bulk edit plan handles



Context:

Whenever we bring on a new client, or whenever we do account handovers from one CSM to another, we are going to need to update the fields in request 1 for all users on that account. It would be a huge time saver to do this for multiple users and accounts in one go via the bulk edit section.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/additional-mandatory-fields-for-user-creation-in-admin)

---

## Capability to include the question number (from the survey) or the full question within crosstabs

**Status:** Rejected
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

This would be helpful so that you would know exactly what question that attribute came from (you can obviously see the area this sits within, for example ‘personal interests’)

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/capability-to-include-the-question-number-from-the-survey-or)

---

## Image Export for Vertical Bar Charts

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

Hi,

Great that we have introduced vertical bar charts. However, when clients export the image or pdf, it still downloads a horizontal bar chart format. Are we able to work on this to ensure clients also download a vertical bar chart format in image or PDF when they export the charts?

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/image-export-for-vertical-bar-charts)

---

## The ability to define “default audiences”:

**Status:** Future consideration
 | **Upvotes:** 16
 | **Board:** 📊 Platform

**Tags:** Audiences, Charts

**Feedback:**

The problem you and your client has encountered

* In the past, the idea of automatic rebasing has been proposed [https://globalwebindex.slack.com/archives/C048178T5LK/p1700746749547969] by the CSI team to help clients but was deemed out of scope by the platform team, given that the platform is a content management system and that team does not control what GWI audiences are shown to users (fair enough).

* The Global Research team wants to know if the Platform team can create a “button” in charts where a user can apply the “default” audience (similar to the original proposed idea), but also create a behind-the-scenes functionality (via RMP, etc.) so that the GR team can define the “default audience” for a question on the platform for a syndicated data set. Given that the GR team create / maintain the surveys, define the metadata, and could create different base audiences more easily, it might make more sense for our team to be able to define the audience for the user (so similar to how Labels give a GR or Custom researcher the ability to define the question or metadata text on the platform)

* For example, allow GR the ability to define this audience [https://app.globalwebindex.com/audiences/04351551-c474-4959-937d-a7c3cec858e8] as the “default” audience for this question [https://app.globalwebindex.com/chart-builder/questions/gwi-myv-qhi.q92429].

* Basically, we’re proposing a twist on automatic rebasing (“default rebasing”, if you will) to give users an easier platform experience.

How many users this impacts / scale of the problem

* Anyone who uses the syndicated data sets but:

* this might help give researchers in the Custom team the ability to define their own default audience for their custom studies

* the Trends team currently manually defines and adjusts default audiences for the syndicated data sets. This tool / feature would help make those default audiences in a more visible place and streamline that work.

* it will help reduce work for our Customer Success and Product Services teams, as well as increase client satisfaction / enable more self-service whenever possible

Business Case, if applicable (can you link the idea directly to ROI)

* Re-basing is an expert level skill / feature usually done by the Insights Guru. For non-expert users, there is a high chance of them misinterpreting the data without this feature. Adding this feature would help simply the task and make it easier for other personas to rebase.

* Generally, it would also allowing users of all sorts of skill level to more easily personalize the platform interface



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/the-ability-to-define-default-audiences)

---

## Instant Audience Insights - Exclude showing data that's used to build audience

**Status:** Future consideration
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

Client is suggesting to exclude data in Instant Audience Insights if it’s using an attribute built into an audience.



For example, if the Health Conscious attribute has been used to build the audience, it current screenshot shows 100% describe themselves as health-conscious, which isn’t useful nor does it add any value.



[https://fb-usercontent.fra1.cdn.digitaloceanspaces.com/0191b202-cf52-766c-a864-91eba2bfdddc.png]





**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/instant-audience-insights-exclude-showing-data-thats-used-to-build-2)

---

## Customisable Colours for Charts and Dashboards

**Status:** Future consideration
 | **Upvotes:** 4
 | **Board:** 📊 Platform

**Tags:** Dashboards, Charts

**Feedback:**

Client is from a creative agency, and is requesting for customisable colours for Charts and Dashboards to match the colour of the charts against their client’s logo or colour scheme in the proposals.

Currently, it’s a limitation to them, as the colours are based on the 4 audience segments that they have added in order.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/customisable-colours-for-charts-and-dashboards)

---

## Accessibility for Screen Readers

**Status:** In Review
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Other

**Feedback:**

Feedback from client at IPG (Weber)



We have a colleague who utilizes a screen reader and we are interested in learning about if GWI is an accessible resource for screen readers.  The screen reader they use is Job Access with Speech (JAWS) on the computer and VoiceOver on the phone.  What I have learned is that whether the screen reader will work on the internet version relies on whether the website and program was designed to be accessible with the screen reader.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/accessibility-for-screen-readers)

---

## Metadata: Locations

**Status:** In Review
 | **Upvotes:** 2
 | **Board:** 📈 Data Foundations [INTERNAL]

**Tags:** Dashboards, Crosstabs, Audiences, Charts

**Feedback:**

1. There are several attributes in the surveys where specific brands / leagues are only asked to a handful of markets. However, in previous waves, they were asked in many or all markets. When this change occurs, the Locations metadata does not update automatically. The suggestion is to update the metadata only read location info from the most recent wave so users are not confused.

2. This impacts all users of the platform when the metadata is not displayed correctly



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/metadata-locations)

---

## Audience Pagination BE improvements

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Audiences

**Feedback:**

What

Introduce new pagination & search endpoints to Audeinces

Why

By introducing new endpoints we can separate search from pagination, improving the audiences listing speeds

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/audience-pagination-be-improvements)

---

## Line Charts in Dashboards

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

What

Turn on the current line charts for all Pro users (no design updates)



Why

By introducing line charts for all users, we essentially have a pre-built prototype for line charts / trending data in platform. This experiment will enable us to gather data to better inform future trending decisions.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/line-charts-in-dashboards)

---

## Dashboard BE migration

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

What

Migration of the Dashboard BE repositories from the calculation squad to Phoenix

Why

To have full ownership and unlock engineering speed and efficiency.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dashboard-be-migration)

---

## Horizontal Stacked Bar Charts

**Status:** Completed
 | **Upvotes:** 2
 | **Board:** 📊 Platform

**Tags:** Dashboards

**Feedback:**

What

New chart type for matrix questions and beyond



Why

We currently cannot display matrix platform in dashboards. This will offer a new visualisation medium to enhance storytelling. Matrix questions are often commissioned in custom studies and this will enhance the in-house custom offering, such as the Publicis 650k deal.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/horizontal-stacked-bar-charts)

---

## Share & Invite

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Dashboards, Charts

**Feedback:**

WHAT IS SHARE AND INVITE?

Share and invite is a new feature that is now live in the GWI platform. This feature allows professional users (Pro) to share their charts and dashboards with free users in their organisation. This is a brand new way for our clients to invite their team members (free-users) to join GWI, automating the way they get access to shared content in a read only way - aka say no more to sharing screen grabs.



WHAT PROBLEM(S) DOES IT ADDRESS? 

Let’s be real, our users are constantly making great discoveries and uncovering game-changing insights that simply beg to be shared with their team members. But here’s the catch, the process of sharing these golden nuggets of data and getting them into the right hands, whether it's in a chart or a dashboard, can be time consuming and inefficient. 


When insights are trapped within a team or platform, their potential to drive decision making and spark innovation remains untapped. By enabling seamless sharing of data and insights, we’re empowering every stakeholder in an organisation to contribute and in 

turn, collaborate better.


Imagine a scenario where you’re an analyst, time is of the essence - the CEO needs to verify everything you’re put together in real time but, they aren’t a Pro user. Up until now, 

you would’ve needed to send multiple screenshots of your chart followed by a few notes.



Supporting Docs:

* GTM [https://docs.google.com/document/d/1ZD4zNOltIQMtVI9o1MX9NYDKAeRmYVpUE3Qv0TbUHe8/edit#heading=h.xxgzzrpyx2s2]

* Tracking [https://mixpanel.com/project/522715/view/57099/app/boards#id=7486573]

* DB only vs Share & invite view [https://docs.google.com/document/d/1Cl4FWz9QwJhbXyG_dHiWRYDKEp5zkDljcIlWDuMW76A/edit#heading=h.jxx4o5tswkd2]

* FAQ [https://docs.google.com/document/d/1Y8ygHEjT6Xluc8nfaIR7m6jgtJqIUv5r8aeBGGTI9bg/edit#heading=h.lrdwvivb1l9p]



**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/share-and-invite-2)

---

## Starter Pack Upgrade v1.1

**Status:** Completed
 | **Upvotes:** 3
 | **Board:** 📊 Platform

**Tags:** Calculations

**Feedback:**

In this iteration we aim to increase location access for free users.



What problem(s) are we trying to solve?

Free users currently only have access 2 locations / markets, which makes it challenging for them to fully grasp the value of our product offering. Enhancing their access could help increase adoption or even encourage them to consider upgrading their plan.



Product Requirements Document Link: https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4266426401/GWI+Starter+Pack+Upgrade [https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4266426401/GWI+Starter+Pack+Upgrade]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/starter-pack-upgrade-v11)

---

## Starter Pack Upgrade v1

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Feedback:**

This initiative aims to upgrade the starter pack for free users by increasing their data access.



What problem(s) are we trying to solve?

Free users currently have limited access to our dataset, which makes it challenging for them to fully grasp the value of our product offering. Enhancing their access could help increase adoption or even encourage them to consider upgrading their plan.





Product Requirements Document Link: https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4266426401/GWI+Starter+Pack+Upgrade [https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4266426401/GWI+Starter+Pack+Upgrade]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/starter-pack-upgrade-v1)

---

## Sign-up Optimisation v.1

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** User Management

**Feedback:**

This initiatives aims to integrate single sign-on into the signup process. In doing so, individuals will be able to create a new GWI account using Google and Microsoft IdP.



What problem(s) are we trying to solve?

The existing signup process has friction points because it involves multiple steps and requires individuals to provide a signification amount of information before they can create a new account to access platform. As a result, indidivuals abandon the signup process without completing it.



Product Requirement Document Link: https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4107665426/SSO+Integration+v.1 [https://globalwebindex.atlassian.net/wiki/spaces/TECH/pages/4107665426/SSO+Integration+v.1]

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/sign-up-optimisation-v1)

---

## Dataset filter in Crosstabs

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

This initiative will enable users to filter their search results at a dataset level.



WHen users have access to lots of datasets/custom projects, it become difficult to find the relevant information they're looking for.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/dataset-filter-in-crosstabs)

---

## Unfreezing filter option

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

This initiative will enable users to select their wave or location filters before adding an attribute in their crosstabs.



Solving this issue will remove friction for users when building their project, and will lower the number of N/As in crosstabs.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/unfreezing-filter-option)

---

## Editing attribute selection

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Crosstabs

**Feedback:**

This initiative will enable users to edit their existing expression beyond only adding new attributes. Specifically we will allow users to remove attribute & change the connectors or groups between attributes.

The only known workaround to perform any of those 3 actions is to rebuild the expression from scratch. This is an issue as it introduces friction when exploring our data, and slows down the user’s analysis work.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/editing-attribute-selection)

---

## Vertical charts

**Status:** Completed
 | **Upvotes:** 1
 | **Board:** 📊 Platform

**Tags:** Charts

**Feedback:**

We will introduce a new view option in Charts, allowing users to see vertical bars instead of horizontal.



1) This view will address the need to be able to see changes over time, by making it more visually spottable than view the classic charts view. 2) This is the last parity item from P1 that is stopping researchers from fully adopting P2.

**Engineering Notes (to be filled in Cursor):**

- Impacted services/components:
- Proposed solution:
- Risks / edge cases:
- Tests to add/update:

[Source](https://feedback.gwi.com/p/vertical-charts-3)

---
