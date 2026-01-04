import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { ShoppingBag, Calendar, LayoutDashboard } from 'lucide-react';

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10',
        },
      }}
      afterSignOutUrl="/"
    >
      <ClerkUserButton.MenuItems>
        <ClerkUserButton.Link
          label="My Orders"
          labelIcon={<ShoppingBag className="w-4 h-4" />}
          href="/dashboard/my-orders"
        />
        <ClerkUserButton.Link
          label="My Bookings"
          labelIcon={<Calendar className="w-4 h-4" />}
          href="/dashboard/my-bookings"
        />
        <ClerkUserButton.Link
          label="User Dashboard"
          labelIcon={<LayoutDashboard className="w-4 h-4" />}
          href="/dashboard"
        />
      </ClerkUserButton.MenuItems>
    </ClerkUserButton>
  );
}
