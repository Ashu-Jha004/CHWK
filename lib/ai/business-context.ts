// Business Context Builder - Extract business information for AI context
import { prisma } from "@/lib/prisma";
import type { BusinessContext } from "@/lib/ai/types";

export async function buildBusinessContext(businessId: string): Promise<BusinessContext | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      categories: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        take: 1,
      },
      hours: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      staff: {
        where: { isActive: true },
        select: {
          name: true,
          designation: true,
        },
        take: 5, // Top 5 staff
      },
      menuItems: {
        where: { isAvailable: true },
        select: {
          name: true,
          price: true,
        },
        take: 10, // Top 10 items
      },
    },
  });

  if (!business) return null;

  // Format working hours
  const hours = formatBusinessHours(business.hours);

  // Get primary category
  const category = business.categories[0]?.category.name || "Business";

  // Build services list (from description or generic)
  const services = extractServices(business.description);

  // Format staff list
  const staffList = business.staff.map(s =>
    s.designation ? `${s.name} (${s.designation})` : s.name
  );

  // Format product/menu list
  const productList = business.menuItems.map(m =>
    `${m.name} ($${m.price})`
  );

  return {
    name: business.name,
    category,
    services,
    hours,
    address: `${business.addressLine1}, ${business.area ? business.area + ", " : ""}${business.city}, ${business.state} - ${business.pincode}`,
    phone: business.phone,
    priceRange: business.priceRange || undefined,
    description: business.shortDescription || business.description?.substring(0, 200) || undefined,
    website: business.website || undefined,
    whatsapp: business.whatsappNumber || undefined,
    staff: staffList,
    products: productList,
  };
}

function formatBusinessHours(hours: any[]): string {
  if (!hours || hours.length === 0) return "Contact us for hours";

  const dayMap: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  const hoursText = hours.map(h => {
    if (h.isClosed) return `${dayMap[h.dayOfWeek]}: Closed`;
    return `${dayMap[h.dayOfWeek]}: ${h.openTime} - ${h.closeTime}`;
  }).join(", ");

  return hoursText || "Contact us for hours";
}

function extractServices(description: string | null): string[] {
  if (!description) return [];

  // Simple extraction - can be enhanced with NLP
  const services = [];
  const lower = description.toLowerCase();

  // Common service keywords
  const keywords = ['repair', 'installation', 'maintenance', 'delivery', 'consultation', 'service', 'plumbing', 'electrical', 'cleaning'];

  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      services.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  return services.length > 0 ? services.slice(0, 5) : ['General services'];
}
