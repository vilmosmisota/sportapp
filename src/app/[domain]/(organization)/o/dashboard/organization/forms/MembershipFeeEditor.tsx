import React, { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMembershipCategories } from "@/entities/membership-category/MembershipCategory.query";
import { CurrencyTypes } from "@/entities/common/Types";
import { getCurrencySymbol } from "@/entities/player-fee-category/PlayerFeeCategory.utils";

type MembershipCategory = {
  id: number;
  name: string;
  description: string;
};

type MembershipFee = {
  membershipCategory: MembershipCategory;
  id: number;
  createdAt: Date;
  membershipCategoryId: number;
  price: number;
};

type MembershipFeeEditorProps = {
  tenantId: string;
  initialMembershipFees: MembershipFee[];
  onUpdate: (updatedFees: MembershipFee[]) => void;
  currency: CurrencyTypes;
};

const MembershipFeeEditor = ({
  tenantId,
  initialMembershipFees,
  onUpdate,
  currency,
}: MembershipFeeEditorProps) => {
  const [membershipFees, setMembershipFees] = useState<MembershipFee[]>(
    initialMembershipFees
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFee, setNewFee] = useState({ categoryId: "", price: "" });

  const {
    data: membershipCategories,
    isLoading,
    error,
  } = useMembershipCategories(tenantId);

  const filteredCategories = membershipCategories?.filter((category) => {
    return !membershipFees.some(
      (fee) => fee.membershipCategoryId === category.id
    );
  });

  const handlePriceChange = (fee: MembershipFee, newPrice: string) => {
    const parsedPrice = parseFloat(newPrice) || 0;
    const updatedFees = membershipFees.map((f) => {
      if (f.id === fee.id) {
        return {
          ...f,
          price: parsedPrice,
        };
      }
      return f;
    });

    setMembershipFees(updatedFees);
    onUpdate(updatedFees);
  };

  const handleRemove = (feeId: number) => {
    const updatedFees = membershipFees.filter((fee) => fee.id !== feeId);
    setMembershipFees(updatedFees);
    onUpdate(updatedFees);
  };

  const handleAddNew = () => {
    const selectedCategory = membershipCategories?.find(
      (cat) => cat.id.toString() === newFee.categoryId
    );

    if (!selectedCategory || !newFee.price) return;

    const newMembershipFee: MembershipFee = {
      membershipCategory: {
        id: selectedCategory.id,
        name: selectedCategory.name,
        description: selectedCategory.description,
      },
      id: Date.now(),
      createdAt: new Date(),
      membershipCategoryId: selectedCategory.id,
      price: parseFloat(newFee.price),
    };

    const updatedFees = [...membershipFees, newMembershipFee];
    setMembershipFees(updatedFees);
    onUpdate(updatedFees);
    setNewFee({ categoryId: "", price: "" });
    setIsAddingNew(false);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewFee({ categoryId: "", price: "" });
  };

  if (isLoading)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            Loading membership categories...
          </div>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32 text-red-500">
            Error loading membership categories. Please try again.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Membership Fees</CardTitle>
          {!isAddingNew &&
            filteredCategories &&
            filteredCategories?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Fee
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membershipFees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">
                  {fee.membershipCategory.name}
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      value={fee.price}
                      onChange={(e) => handlePriceChange(fee, e.target.value)}
                      className="w-24 pl-7"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(fee.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {isAddingNew && (
              <TableRow>
                <TableCell>
                  <Select
                    value={newFee.categoryId}
                    onValueChange={(value) =>
                      setNewFee({ ...newFee, categoryId: value })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      value={newFee.price}
                      onChange={(e) =>
                        setNewFee({ ...newFee, price: e.target.value })
                      }
                      placeholder="Enter price"
                      className="w-24 pl-7"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddNew}
                    disabled={!newFee.categoryId || !newFee.price}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelAdd}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MembershipFeeEditor;
