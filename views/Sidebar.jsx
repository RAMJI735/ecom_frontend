"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import navbarData from "../navbar.json";
import { useAuth } from "@context/authContext";
import ThemeToggle from "@/app/(dashboard)/theme/page";
import { orderService } from "@service/order/orderService";
import { useState, useEffect } from "react";
import { FaToggleOn, FaToggleOff, FaBars } from "react-icons/fa";

function renderIcon(iconName) {
  const iconProps = {
    className: "w-5 h-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    viewBox: "0 0 24 24",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (iconName) {
    case "dashboard":
      return (
        <svg {...iconProps}>
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...iconProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "box":
      return (
        <svg {...iconProps}>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    case "shopping-cart":
      return (
        <svg {...iconProps}>
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      );
    case "users":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "user-check":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "chart":
      return (
        <svg {...iconProps}>
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...iconProps}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

export default function Sidebar({ items = navbarData }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [navItems, setNavItems] = useState(items);

  const [smlgth, setsmlgth] = useState(0);

  useEffect(() => {
    setsmlgth(window.innerWidth)
    window.addEventListener("resize", () => {
      setsmlgth(window.innerWidth)
    })
  }, [])
  useEffect(() => {
    orderService
      .getStats()
      .then((stats) => {
        if (!stats) return;
        setNavItems((prev) =>
          prev.map((item) => {
            if (item.id === "orders-menu") {
              const updatedSubmenu = item.submenu?.map((sub) => {
                if (sub.id === "pending-orders") {
                  return { ...sub, badge: stats.pending > 0 ? String(stats.pending) : null };
                }
                return sub;
              });
              return {
                ...item,
                badge: stats.pending > 0 ? String(stats.pending) : null,
                submenu: updatedSubmenu,
              };
            }
            return item;
          })
        );
      })
      .catch(() => { });
  }, [pathname]);

  const isLinkActive = (path) => {
    if (!path) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const isSubmenuActive = (submenu) => {
    if (!Array.isArray(submenu)) return false;
    return submenu.some((subItem) => isLinkActive(subItem.path));
  };


  const [toggleSide, setToggleSide] = useState(false)
  const toggleFun = () => {
    setToggleSide(!toggleSide)
  }


  return (
    <div
      className={`
    fixed z-10 top-0 left-0 h-screen w-60
    transition-transform duration-300
    md:relative md:translate-x-0
    ${toggleSide ? "translate-x-0" : "-translate-x-full"}
  `}
    >


      <aside className="w-64 h-screen shrink-0 bg-base-200 border-r border-base-300 flex flex-col justify-between select-none sticky top-0 overflow-hidden">
        {/* Upper Section: Brand + Navigation */}

        <div className="p-2">
          <button
            onClick={toggleFun}
            className="w-full h-10 bg-indigo-700 hover:bg-indigo-800
               text-white rounded-md flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <FaBars size={22} />
          </button>
        </div>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-base-300 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base leading-tight tracking-tight text-base-content truncate">
                ElectroCare
              </h2>
              <span className="text-xs text-base-content/60 font-medium truncate block">
                E-Commerce & Service
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* DaisyUI Menu Navigation */}
          <div className="p-2 flex-1 overflow-y-auto [scrollbar-width:thin]">
            <ul className="menu menu-md w-full gap-1">
              {navItems.map((item) => {
                const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
                const hasActiveChild = hasSubmenu && isSubmenuActive(item.submenu);
                const isCurrentActive = isLinkActive(item.path);

                if (hasSubmenu) {
                  return (
                    <li key={item.id || item.title}>
                      <details open={hasActiveChild}>
                        <summary className="font-medium hover:bg-base-300/60 transition-colors">
                          {renderIcon(item.icon)}
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <span
                              className={`badge badge-sm ${item.badgeColor || "badge-neutral"
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </summary>
                        <ul className="before:bg-base-300">
                          {item.submenu.map((subItem) => {
                            const isChildActive = isLinkActive(subItem.path);
                            return (
                              <li key={subItem.id || subItem.path}>
                                <Link
                                  href={subItem.path || "#"}
                                  onClick={() => { if (smlgth <= 600) toggleFun() }}
                                  className={`text-sm ${isChildActive ? "active font-medium" : ""
                                    }`}
                                >
                                  {subItem.icon && renderIcon(subItem.icon)}
                                  <span className="flex-1 truncate">{subItem.title}</span>
                                  {subItem.badge && (
                                    <span
                                      className={`badge badge-sm ${subItem.badgeColor || "badge-neutral"
                                        }`}
                                    >
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </li>
                  );
                }

                // Top-level item without submenu
                return (
                  <li key={item.id || item.path || item.title}>
                    <Link
                      href={item.path || "#"}
                      className={`font-medium ${isCurrentActive ? "active" : ""}`}
                    >
                      {renderIcon(item.icon)}
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`badge badge-sm ${item.badgeColor || "badge-neutral"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>


        {/* Footer Profile / Status */}
        <div className="p-3 border-t border-base-300 m-2 rounded-xl bg-base-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="avatar online placeholder shrink-0">
              <div className="bg-primary text-primary-content rounded-full w-8 h-8 text-xs font-semibold uppercase">
                {user?.name ? user.name.slice(0, 2) : user?.email ? user.email.slice(0, 2) : "EC"}
              </div>
            </div>
            <div className="leading-tight truncate">
              <p className="text-xs font-semibold text-base-content truncate">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[11px] text-base-content/60 truncate">
                {user?.email || "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="btn btn-ghost btn-circle btn-xs text-error/80 hover:text-error hover:bg-error/10 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </div>
  );
}
