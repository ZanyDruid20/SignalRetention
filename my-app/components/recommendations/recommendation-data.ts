export interface RecommendationCard {
    id: string;
    customerName: string;
    companyName: string;
    priority: "High" | "Medium" | "Low";
    action: string;
    revenueSaved: string;
    confidenceScore: number;
    reason: string;
    completed: boolean;
}

export interface RecommendationQueueItem {
    id: string;
    customer: string;
    riskLevel: "Critical" | "High" | "Moderate" | "Low";
    recommendation: string;
    impact: string;
    status: "New" | "In Progress" | "Completed";
}

const mockRecommendations: RecommendationCard[] = [
    {
        id: "1",
        customerName: "David Kim",
        companyName: "Enterprise Co",
        priority: "High",
        action: "Immediate Outreach",
        revenueSaved: "$45,000",
        confidenceScore: 89,
        reason: "High churn probability detected based on recent engagement metrics.",
        completed: false
    },
    {
        id: "2",
        customerName: "Sarah Chen",
        companyName: "Innovate Inc",
        priority: "Medium",
        action: "Follow-up Call",
        revenueSaved: "$25,000",
        confidenceScore: 75,
        reason: "Potential upsell opportunity identified.",
        completed: false
    },
    {
        id: "3",
        customerName: "Marcus Johnson",
        companyName: "TechFlow",
        priority: "Low",
        action: "Send Survey",
        revenueSaved: "$8,900",
        confidenceScore: 60,
        reason: "Customer satisfaction survey needed.",
        completed: false
    },
    {
        id: "4",
        customerName: "Emily Rodriguez",
        companyName: "Global Solutions",
        priority: "High",
        action: "Premium tier upsell",
        revenueSaved: "$60,000",
        confidenceScore: 92,
        reason: "High-value lead with strong engagement signals.",
        completed: true
    },
    {
        id: "5",
        customerName: "Lisa Thompson",
        companyName: "MarketPro LLC",
        priority: "Medium",
        action: "Quarterly Check-in Call",
        revenueSaved: "$15,000",
        confidenceScore: 70,
        reason: "Scheduled quarterly check-in to review account status.",
        completed: true
    },

    {
        id: "6",
        customerName: "James Lee",
        companyName: "NextGen Tech",
        priority: "Low",
        action: "Send Product Update Email",
        revenueSaved: "$5,000",
        confidenceScore: 85,
        reason: "Inform customer about new product features and updates.",
        completed: true
    }

];

export const mockQueueItems: RecommendationQueueItem[] = [
  {
    id: "1",
    customer: "Enterprise Co",
    riskLevel: "Critical",
    recommendation: "Offer dedicated account manager",
    impact: "$45,000",
    status: "New",
  },
  {
    id: "2",
    customer: "Innovate Inc",
    riskLevel: "Critical",
    recommendation: "Renew contract negotiation",
    impact: "$52,000",
    status: "In Progress",
  },
  {
    id: "3",
    customer: "TechFlow",
    riskLevel: "High",
    recommendation: "Feature enablement training",
    impact: "$28,500",
    status: "New",
  },
  {
    id: "4",
    customer: "Global Solutions",
    riskLevel: "Moderate",
    recommendation: "Premium tier upsell",
    impact: "$35,000",
    status: "Completed",
  },
  {
    id: "5",
    customer: "MarketPro LLC",
    riskLevel: "Moderate",
    recommendation: "Quarterly check-in call",
    impact: "$18,000",
    status: "New",
  },
  {
    id: "6",
    customer: "NextGen Tech",
    riskLevel: "Critical",
    recommendation: "Discount retention offer",
    impact: "$62,000",
    status: "New",
  },
];


export function getPriorityColor(priority: string) {
    switch (priority) {
        case "High":
            return "bg-red-50 text-red-700 border-red-200";
        case "Medium":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Low":
            return "bg-green-50 text-green-700 border-green-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

export function getRiskLevelColor(level: string) {
  switch (level) {
    case "Critical":
      return "bg-red-50 text-red-700";
    case "High":
      return "bg-orange-50 text-orange-700";
    case "Moderate":
      return "bg-amber-50 text-amber-700";
    case "Low":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-50 text-blue-700";
    case "In Progress":
      return "bg-purple-50 text-purple-700";
    case "Completed":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

export { mockRecommendations };