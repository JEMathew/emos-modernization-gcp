/**
 * Fictional sample enterprise portfolio CSV datasets for EMOS evaluation.
 * Collective coverage exercises all 6 canonical 6R dispositions:
 * Retain, Retire, Rehost, Replatform, Refactor, Repurchase.
 *
 * NOTE: Portfolio input files contain only enterprise FACTS.
 * EMOS derives the 6R recommendation from the evidence.
 */

export interface SampleCsvDataset {
  id: string;
  filename: string;
  title: string;
  industry: string;
  description: string;
  workloadCount: number;
  csvContent: string;
}

export const EMOS_TEMPLATE_CSV = `workload_id,workload_name,workload_type,business_capability,business_criticality,modernization_drivers,runtime,database,hosting,technology_lifecycle_risk,known_dependencies,dependency_details,infrastructure_cost,licensing_cost,tco_baseline,customer_data,data_volume_velocity,compliance_constraints,target_cloud_platform,target_architecture_constraints,migration_downtime_tolerance
APP-001,Replace with your workload name,Application,,,,,,,,,,,,,,,,,,`;

export const EMOS_FIELD_GUIDE = [
  ['Required', 'workload_id', 'A unique identifier for each workload.'],
  ['Required', 'workload_name', 'The application, platform or system name.'],
  ['Required', 'workload_type', 'Application or Data Platform.'],
  ['Evidence', 'business_*', 'Capability, criticality and modernization drivers.'],
  ['Evidence', 'runtime / database / hosting', 'Current technology and deployment context.'],
  ['Evidence', 'known_dependencies / dependency_details', 'Interfaces and dependency constraints.'],
  ['Evidence', 'infrastructure_cost / licensing_cost / tco_baseline', 'Current economics and TCO evidence.'],
  ['Evidence', 'customer_data / data_volume_velocity / compliance_constraints', 'Data characteristics and risk constraints.'],
  ['Evidence', 'target_* / migration_downtime_tolerance', 'Target-state and transition constraints.'],
] as const;

export const DIVERSIFIED_ENTERPRISE_CSV = `workload_id,workload_name,workload_type,business_capability,business_criticality,modernization_drivers,runtime,database,hosting,technology_lifecycle_risk,known_dependencies,dependency_details,infrastructure_cost,licensing_cost,tco_baseline,customer_data,data_volume_velocity,compliance_constraints,target_cloud_platform,target_architecture_constraints,migration_downtime_tolerance
HR-PORTAL-01,Global Employee Directory,Application,HR Management,Low,"Low usage, Duplicate modern corporate directory active, High patching overhead",PHP 5.6,MySQL 5.5,On-premises,High,3 downstream LDAP syncs,LDAP sync only with deprecation notice underway,Low,Low,Established,Employee Contact,Under 100MB,Internal only,None,Decommission,Full downtime allowed
FIN-GL-LEGACY,Legacy General Ledger,Application,Core Financial Accounting,High,"Data center lease expiring, Strict regulatory freeze, System stable with zero defect backlog",Java 17 LTS,PostgreSQL 15,On-premises Colocation,Low,12 financial ledger interfaces,Well-documented REST and SFTP feeds,Moderate,Low,Calculated,Financial Ledger Records,1.5 TB,SOX and GAAP compliant,IaaS Cloud,Lift-and-shift VM migration without redesign,Weekend 12-hour maintenance window
SUPPLY-PLAN-CORE,Enterprise Supply Planning,Application,Supply Chain Optimization,High,"Horizontal auto-scaling during demand peaks, Batch job runtime exceeding SLA, Aging monolithic containerization debt",Java 11 Spring Boot,Oracle 19c,On-premises VM,Moderate,8 ERP interfaces,REST and JMS messaging,High,High,High Oracle license overhead,Proprietary Supply Chain,4 TB,Export compliance,Managed Cloud Containers,Containerized microservices with managed cloud database,4 hours maximum
LEGACY-EXPENSE,Legacy Travel Expense Tracker,Application,Expense Processing,Medium,"High custom maintenance overhead, Commodity business capability, Modern SaaS alternatives available with superior mobile features",ASP.NET 4.0,SQL Server 2008,On-premises,Severe,Payroll and banking file export,Point-to-point batch files,Moderate,Moderate,High ongoing patching effort,Employee Travel and Expense,500 GB,PCI and Corporate audit,SaaS Solution,SaaS replacement,Flexible cutover
BI-DATAMART-01,Regional Sales Data Mart,Data Platform,Commercial Reporting,Medium,"Stable analytical reporting, Low query volume, Recent hardware refresh completed",PostgreSQL 14,PostgreSQL 14,On-premises Colocation,Low,4 reporting dashboards,Nightly batch syncs,Low,Low,Fully amortized hardware,Aggregated Sales Figures,800 GB,Internal sales data,On-premises,Maintain current architecture,No change required`;

export const FINANCIAL_SERVICES_CSV = `workload_id,workload_name,workload_type,business_capability,business_criticality,modernization_drivers,runtime,database,hosting,technology_lifecycle_risk,known_dependencies,dependency_details,infrastructure_cost,licensing_cost,tco_baseline,customer_data,data_volume_velocity,compliance_constraints,target_cloud_platform,target_architecture_constraints,migration_downtime_tolerance
TRADE-CLEAR-CORE,Fixed Income Clearing Engine,Application,Securities Settlement,High,"Sub-millisecond latency requirements, Inability of legacy monolith to handle trading volume spikes, Need for event-driven distributed architecture",C++ / CORBA legacy monolith,Sybase ASE 16,On-premises Mainframe/Solaris,Critical,24 exchange and settlement feeds,Complex synchronous RPC and MQ messaging,High,High,High hardware maintenance and specialized engineering costs,Financial Transaction Data,12 TB / 10M events daily,SEC Rule 17a-4 and FINRA,Cloud Native Event-Driven,Distributed microservices with Kafka and serverless streaming,Zero unplanned downtime / active-active cutover
REG-REPORT-2015,Dodd-Frank 2015 Archival Reporter,Application,Historical Compliance Archiving,Low,"Mandatory 7-year regulatory retention period expired, Zero active users, Duplicate central data warehouse repository",Python 2.7,Informix,On-premises,High,1 central data warehouse feed,Read-only static archive,Low,Moderate,Obsolete license costs,Historical Financial Trades,300 GB static,Historic records only,None,Decommission and purge archive,Full downtime allowed
RISK-CALC-GRID,Market Risk Calculation Grid,Data Platform,Quantitative Risk Modeling,High,"Compute grid capacity limits during market volatility, High on-premises server licensing costs, Business demand for on-demand cloud compute burst",Python 3.10 and C++,Redis + MongoDB,On-premises High-Performance Cluster,Low,6 market feed ingestion services,ZeroMQ and gRPC,High,High,Annual hardware cluster refresh,Market Risk Sensitivities,8 TB in-memory,Basel III and FRTB,Cloud High Performance Compute,Rehost compute grid nodes to cloud HPC VMs with auto-scaling,Weekend maintenance window
WEALTH-PORTAL,Wealth Advisory Client Portal,Application,Client Account Services,High,"Slow feature release cycles, Monolithic deployment bottleneck, Outdated UI framework, Need for API-first mobile experience",Java 8 WebLogic Monolith,Oracle 12c,On-premises,High,14 core banking and market data services,SOAP web services with tight coupling,High,High,High WebLogic license fee,Client Portfolio Holdings and PII,2 TB,GLBA and SEC Data Privacy,Cloud Native Microservices,Decoupled React frontend + Spring Cloud containerized microservices,2 hours cutover window
AML-CASE-MGMT,Anti-Money Laundering Case Tracker,Application,Regulatory Compliance Investigation,High,"Proprietary legacy case tool, High customization backlog, Vendor sunsetting legacy platform, Industry standard AML SaaS platforms available",Legacy VB.NET,SQL Server 2012,On-premises,Elevated,5 transaction monitoring feeds,Batch CSV imports,Moderate,High,High custom compliance tool maintenance,Suspicious Activity Reports,1.2 TB,BSA and AML and FinCEN,Compliance Cloud SaaS,Turnkey AML investigation SaaS platform,Parallel run 30 days`;

export const RETAIL_ENTERPRISE_CSV = `workload_id,workload_name,workload_type,business_capability,business_criticality,modernization_drivers,runtime,database,hosting,technology_lifecycle_risk,known_dependencies,dependency_details,infrastructure_cost,licensing_cost,tco_baseline,customer_data,data_volume_velocity,compliance_constraints,target_cloud_platform,target_architecture_constraints,migration_downtime_tolerance
POS-STORE-STORED,Store Point-of-Sale Terminal Backend,Application,In-Store Checkout,High,"Hardened stable local store servers, Zero connectivity offline checkout requirement, Fully compliant PCI terminal software recently updated",C# .NET 8 LTS,SQLite + PostgreSQL,Edge In-Store Mini Servers,Low,Central inventory and ERP sync,Asynchronous store forward queuing,Low,Low,Fully amortized hardware,Payment Tokens,50 GB per store,PCI-DSS Level 1,Edge Compute,Retain at edge store tier,Zero downtime required
ECOMM-CATALOG,E-Commerce Product Catalog,Application,Digital Merchandising,High,"Catalog search latency during Black Friday surges, High hardware lease costs, Legacy database locking issues, Need for elastic caching",Node.js / Express monolith,PostgreSQL 11,On-premises Colocation,Moderate,10 frontend and mobile store channels,REST API with Redis caching,High,Moderate,High colocation surge costs,Product Master and Pricing,500 GB,Public product data,Managed Cloud Containers,Migrate to managed Kubernetes service + Cloud Managed PostgreSQL,1 hour maintenance window
LOYALTY-POINTS-ENGINE,Customer Loyalty Points Engine,Application,Customer Rewards,High,"Monolithic database unable to handle real-time reward accrual, Tight batch coupling, Need for real-time personalization and microservices",Java 7 Monolith,DB2 on Linux,On-premises,High,16 omnichannel checkout touchpoints,Legacy MQ Series queues,High,High,High DB2 licensing overhead,Customer Profiles and Reward Balances,6 TB,GDPR and CCPA,Cloud Native Event Streams,Event-driven microservices on Kafka and serverless functions,4 hours cutover window
CUSTOMER-SERVICE-DESK,Internal Customer Service Ticketing,Application,Customer Support,Medium,"Outdated internal ticket tracking tool, Heavy developer maintenance, Lacks omnichannel chat and AI features found in commercial SaaS",Python Django 1.11,MySQL 5.6,On-premises VM,Elevated,2 customer account lookup feeds,REST queries,Moderate,Low,Internal engineering support costs,Customer Support Interactions,800 GB,CCPA and Privacy,Customer Support SaaS,Migrate to enterprise customer support SaaS platform,Weekend data migration
PRINT-LABEL-GEN,Store Shelf Print Label Generator,Application,In-Store Merchandising,Low,"Obsolete desktop utility for barcode printing, In-store zebra printers replaced with cloud-connected IoT printers, Capability integrated into central ERP",Visual Basic 6,Access DB,Local In-Store PCs,Severe,None,Direct local COM port printing,Negligible,Negligible,Obsolete OS maintenance,None,Under 10MB,None,None,Decommission and archive templates,No impact`;

export const MANUFACTURING_ENTERPRISE_CSV = `workload_id,workload_name,workload_type,business_capability,business_criticality,modernization_drivers,runtime,database,hosting,technology_lifecycle_risk,known_dependencies,dependency_details,infrastructure_cost,licensing_cost,tco_baseline,customer_data,data_volume_velocity,compliance_constraints,target_cloud_platform,target_architecture_constraints,migration_downtime_tolerance
MES-PLANT-FLOOR,Manufacturing Execution System (MES),Application,Plant Floor Operations,High,"Critical shop-floor automation, Direct PLC and SCADA industrial bus connections, Millisecond cycle times, Regulatory validated manufacturing process",C++ / Qt Industrial Runtime,Microsoft SQL Server 2019,On-premises Plant Server,Low,18 shop-floor automation cells,OPC-UA and Industrial Ethernet,Moderate,Moderate,Amortized industrial hardware,Industrial Telemetry and Part Specs,3 TB,ISO 9001 and OSHA,On-premises Plant,Maintain on-premises industrial tier,Zero production disruption
SUPPLY-EDI-HUB,Global Supplier EDI Gateway,Application,Supply Chain Transactions,High,"Urgent corporate data center consolidation, Commercial EDI software is fully supported on standard Linux VMs, Low architectural complexity",Java 11 / Red Hat Enterprise Linux 8,PostgreSQL 13,On-premises Corporate Data Center,Low,35 external supplier EDI connections,AS2 and SFTP communication channels,High,Moderate,Data center facility lease fees,Supply Chain Purchase Orders,2 TB,Commercial EDI Standards,Cloud IaaS Virtual Machines,Lift-and-shift VMs to cloud infrastructure with load balancer,Weekend 6-hour maintenance window
PLANT-MAINT-TRACKER,Legacy Plant Maintenance Tracker,Application,Equipment Maintenance,Medium,"Aging client-server database, Inability to support mobile field mechanics, High manual spreadsheet work, Modern cloud CMMS platforms readily available",PowerBuilder 12,Sybase SQL Anywhere,On-premises Plant Workstations,High,1 ERP asset register feed,Batch nightly dump,Moderate,High,High legacy PowerBuilder runtime cost,Plant Equipment Records,400 GB,Internal maintenance logs,Cloud CMMS SaaS,Enterprise Computerized Maintenance Management SaaS,Phased plant rollout
FACTORY-IOT-ANALYTICS,Factory Sensor Telemetry Analytics,Data Platform,Predictive Quality Analytics,High,"Exploding sensor ingestion rates (50K events/sec), On-premises storage nearing capacity, Inability to run real-time machine learning models",Python / Scala Spark Monolith,Hadoop HDFS / Cassandra,On-premises Bare Metal Cluster,High,8 production line telemetry collectors,Kafka and MQTT ingestion,High,High,High bare-metal hardware and storage expansion costs,Machine Sensor Time-Series Data,25 TB / 100M events daily,Proprietary Manufacturing IP,Managed Cloud Data Platform,Replatform Hadoop to managed cloud object storage + serverless query engine,12-hour cutover window
SCRAP-METAL-REPORTER,Historical Scrap Metal Log,Application,Waste Tracking,Low,"Duplicate scrap tracking functionality built into modern SAP ERP, Zero unique business logic, No regulatory retention requirement",Microsoft Access 2003,Access MDB,Shared Network Drive,Severe,None,Manual file copying,Negligible,Negligible,File corruption risk,Historical Scrap Weight Entries,50 MB,None,None,Decommission and archive MDB to cold storage,Full downtime allowed`;

export const SAMPLE_DATASETS: SampleCsvDataset[] = [
  {
    id: 'diversified-enterprise',
    filename: 'diversified-enterprise-portfolio.csv',
    title: 'Diversified Enterprise Portfolio',
    industry: 'Conglomerate / Enterprise Services',
    description: 'Balanced multi-workload portfolio spanning HR, core finance ledger, supply chain planning, expense tracking, and sales data mart.',
    workloadCount: 5,
    csvContent: DIVERSIFIED_ENTERPRISE_CSV,
  },
  {
    id: 'financial-services',
    filename: 'financial-services-portfolio.csv',
    title: 'Financial Services Portfolio',
    industry: 'Banking & Capital Markets',
    description: 'Highly regulated banking workloads including trade clearing engines, market risk compute grids, wealth advisory portal, and AML investigation.',
    workloadCount: 5,
    csvContent: FINANCIAL_SERVICES_CSV,
  },
  {
    id: 'retail-enterprise',
    filename: 'retail-enterprise-portfolio.csv',
    title: 'Retail Enterprise Portfolio',
    industry: 'Omnichannel Commerce',
    description: 'Retail footprint covering in-store edge POS terminals, e-commerce catalog, customer loyalty rewards engine, and support desk.',
    workloadCount: 5,
    csvContent: RETAIL_ENTERPRISE_CSV,
  },
  {
    id: 'manufacturing-enterprise',
    filename: 'manufacturing-enterprise-portfolio.csv',
    title: 'Manufacturing Enterprise Portfolio',
    industry: 'Industrial & Advanced Manufacturing',
    description: 'Plant floor shop operations (MES), global supplier EDI, plant maintenance, factory IoT telemetry, and legacy scrap tracking.',
    workloadCount: 5,
    csvContent: MANUFACTURING_ENTERPRISE_CSV,
  },
];
