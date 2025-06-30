
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu, Plus, LogOut, X } from 'lucide-react';

interface MobileMenuProps {
  onNewVistoria: () => void;
  onLogout: () => void;
  userEmail?: string;
}

const MobileMenu = ({ onNewVistoria, onLogout, userEmail }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleNewVistoria = () => {
    onNewVistoria();
    setOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerDescription>
              {userEmail && `Logado como: ${userEmail}`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-3">
            <Button
              onClick={handleNewVistoria}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Vistoria
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
