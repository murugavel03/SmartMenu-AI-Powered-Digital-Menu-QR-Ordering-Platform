import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicMenu } from "@/services/menu";
import CustomerMenuClient from "./components/CustomerMenuClient";

interface Props {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ table?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const restaurant = await getPublicMenu(restaurantSlug);
  if (!restaurant) return { title: "Menu not found" };

  return {
    title: `${restaurant.name} — Digital Menu`,
    description: restaurant.description || `Order from ${restaurant.name}`,
    openGraph: {
      title: `${restaurant.name} Menu`,
      description: restaurant.description || "",
      images: restaurant.coverImage ? [restaurant.coverImage] : [],
    },
  };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { restaurantSlug } = await params;
  const { table: tableId } = await searchParams;

  const restaurant = await getPublicMenu(restaurantSlug);
  if (!restaurant) notFound();

  return <CustomerMenuClient restaurant={restaurant as never} tableId={tableId} />;
}
