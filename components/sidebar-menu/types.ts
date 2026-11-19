import type { IconType } from "react-icons";

export type MenuItem = {
    label: string;
    href: string;
    icon: IconType;
    roles?: string[];
    badge?: number;
};

export type SidebarUser = {
    id?: string;
    name: string;
    email?: string;
    role?: string;
};

export type SideBarMenuProps = {
    user?: SidebarUser;
    openTickets?: number;
    newTicketHref?: string;
};

export type SidebarSectionProps = {
    title?: string;
    items: MenuItem[];
    collapsed: boolean;
    pathname: string;
};
