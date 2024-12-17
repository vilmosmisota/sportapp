import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MoreVertical, SquarePen } from "lucide-react";
import { useDeleteMembershipCategory } from "@/entities/membership-category/MembershipCategory.actions.client";
import { useMembershipCategories } from "@/entities/membership-category/MembershipCategory.query";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import AddMembershipCategoryForm from "../forms/AddMembershipCategoryForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import EditMembershipCategoryForm from "../forms/EditMembershipCategoryForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { MembershipCategory } from "@/entities/membership-category/MembershipCategory.schema";
import { toast } from "sonner";

interface MembershipCategoriesContentProps {
  tenantId?: number;
}

export default function MembershipCategoriesContent({
  tenantId,
}: MembershipCategoriesContentProps) {
  const {
    data: categories,
    isLoading,
    error,
  } = useMembershipCategories(tenantId?.toString() ?? "");

  const { mutate: deleteCategory } = useDeleteMembershipCategory(
    tenantId?.toString() ?? ""
  );

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MembershipCategory | null>(null);

  const handleConfirm = (categoryId: string) => {
    deleteCategory(categoryId, {
      onSuccess: () => {
        toast.success("Category deleted successfully");
        setIsDeleteOpen(false);
      },
      onError: (error) => {
        toast.error(
          "Failed to delete category. Please ensure all related seasons are updated first."
        );
        console.error("Delete error:", error);
        setIsDeleteOpen(false);
      },
    });
  };

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="flex  items-start gap-3">
      <div className="flex items-center justify-between">
        {/* <h3>Membership categories</h3> */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => setIsAddCategoryOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ResponsiveSheet
        isOpen={isAddCategoryOpen}
        setIsOpen={setIsAddCategoryOpen}
        title="Add Category"
      >
        <AddMembershipCategoryForm
          tenantId={tenantId?.toString() ?? ""}
          setIsParentModalOpen={setIsAddCategoryOpen}
        />
      </ResponsiveSheet>

      <div className="border rounded-lg w-full max-w-screen-md  overflow-hidden">
        <Table className="w-full ">
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead className="text-left p-6">Name</TableHead>
              <TableHead className="text-left p-6">Description</TableHead>
              <TableHead className="text-right p-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="p-6">
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center p-6">
                  <Skeleton className="w-full h-[300px]" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center p-6">
                  <Card className="border-dashed shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base">No Categories</CardTitle>
                    </CardHeader>
                  </Card>
                </TableCell>
              </TableRow>
            )}
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="p-6">
                  <div className="font-medium">{category.name}</div>
                </TableCell>
                <TableCell className="p-6">
                  <div className="text-neutral-600 whitespace-pre-line">
                    {category.description}
                  </div>
                </TableCell>
                <TableCell className="text-right p-6">
                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu onOpenChange={setIsDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-8 w-8 p-0 data-[state=open]:bg-gray-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px] z-50"
                      >
                        <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsEditOpen(true);
                            }}
                            className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                          >
                            <SquarePen className="h-4 w-4" />
                            Edit
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteOpen(true);
                            }}
                            className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCategory && (
        <ResponsiveSheet
          isOpen={isEditOpen && !isDropdownOpen}
          setIsOpen={setIsEditOpen}
          title="Edit Fee Category"
        >
          <EditMembershipCategoryForm
            tenantId={tenantId?.toString() ?? ""}
            category={selectedCategory}
            setIsParentModalOpen={setIsEditOpen}
          />
        </ResponsiveSheet>
      )}

      {selectedCategory && (
        <ConfirmDeleteDialog
          categoryId={selectedCategory.id}
          isOpen={isDeleteOpen && !isDropdownOpen}
          setIsOpen={setIsDeleteOpen}
          text={
            "This will remove this category and all its associated pricing in seasons. Are you sure you want to proceed? This action cannot be undone."
          }
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
