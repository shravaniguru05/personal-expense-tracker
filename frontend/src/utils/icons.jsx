import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Zap,
  HeartPulse,
  Film,
  Plane,
  Home,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Tag,
  CreditCard,
  DollarSign,
  PiggyBank,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';

const iconMap = {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Zap,
  HeartPulse,
  Film,
  Plane,
  Home,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Tag,
  CreditCard,
  DollarSign,
  PiggyBank,
  Wallet,
  MoreHorizontal,
};

export function getCategoryIcon(iconName, props = {}) {
  const IconComponent = iconMap[iconName] || Tag;
  return React.createElement(IconComponent, props);
}

export const AVAILABLE_ICONS = Object.keys(iconMap);

