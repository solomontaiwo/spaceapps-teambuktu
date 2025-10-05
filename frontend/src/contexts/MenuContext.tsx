import { createContext, useContext, useState, ReactNode } from 'react';

type MenuType = 'filter' | 'legend' | 'insert' | null;

interface MenuContextType {
  openMenu: MenuType;
  setOpenMenu: (menu: MenuType) => void;
  toggleMenu: (menu: MenuType) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [openMenu, setOpenMenu] = useState<MenuType>(null);

  const toggleMenu = (menu: MenuType) => {
    setOpenMenu(prevMenu => prevMenu === menu ? null : menu);
  };

  return (
    <MenuContext.Provider value={{ openMenu, setOpenMenu, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
