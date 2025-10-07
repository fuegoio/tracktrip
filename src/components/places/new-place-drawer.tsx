import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { placesCollection } from "@/store/collections";

export const NewPlaceDrawer = ({ travelId }: { travelId: string }) => {
  const [newPlaceName, setNewPlaceName] = useState("");

  const handleAddPlace = () => {
    if (newPlaceName.trim()) {
      placesCollection.insert({
        id: crypto.randomUUID(),
        name: newPlaceName.trim(),
        travel: travelId,
      });
      setNewPlaceName("");
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New place
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-6 overflow-y-auto py-5">
          <div className="flex justify-between">
            <div>
              <DrawerTitle className="font-semibold text-lg text-foreground">
                Add a place
              </DrawerTitle>
              <DrawerDescription>
                Add a place to your travel.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Input
                placeholder="Place name"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddPlace();
                  }
                }}
              />
            </div>
            <DrawerClose asChild>
              <Button onClick={handleAddPlace} className="w-full">
                Add place
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};