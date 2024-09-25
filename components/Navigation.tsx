import React from 'react';
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Button,
} from "@material-tailwind/react";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navListItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Mannschaften",
    href: "/teams",
  },
  {
    label: "Benutzer",
    href: "/users",
  },
];

function NavList() {
  return (
    <List className="mt-4 mb-6 p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1">
      {navListItems.map(({ label, href }, key) => (
        <Link href={href} key={key} passHref>
          <ListItem className="text-white-700">
            <Typography variant="small" color="blue-gray" className="font-normal">
              {label}
            </Typography>
          </ListItem>
        </Link>
      ))}
    </List>
  );
}

export default function Navigation() {
  const [openNav, setOpenNav] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const handleLogout = () => {
    console.log('Logout durchgeführt');
    router.push('/login');
  };

  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-2">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5 lg:ml-2"
        >
          Volleyball Liga
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <div className="hidden gap-2 lg:flex">
          <IconButton variant="text" color="blue-gray">
            <BellIcon className="h-4 w-4" />
          </IconButton>
          <Menu>
            <MenuHandler>
              <Avatar
                variant="circular"
                alt="tania andrew"
                className="cursor-pointer"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
            </MenuHandler>
            <MenuList>
              <Link href="/dashboard" passHref>
                <MenuItem className="flex items-center gap-2">
                  <UserCircleIcon strokeWidth={2} className="h-4 w-4" />
                  <Typography variant="small" className="font-normal">
                    Mein Konto
                  </Typography>
                </MenuItem>
              </Link>
              <MenuItem className="flex items-center gap-2" onClick={handleLogout}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                  />
                </svg>
                <Typography variant="small" className="font-normal">
                  Logout
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          className="lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
        <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
          <IconButton variant="outlined" size="sm" color="blue-gray">
            <BellIcon className="h-4 w-4" />
          </IconButton>
          <Link href="/dashboard" passHref>
            <Button variant="gradient" size="sm" fullWidth className="normal-case">
              Mein Konto
            </Button>
          </Link>
        </div>
      </Collapse>
    </Navbar>
  );
}
