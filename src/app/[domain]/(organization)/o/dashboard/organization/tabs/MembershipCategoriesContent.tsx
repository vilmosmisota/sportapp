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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useUserRoles } from "@/entities/user/hooks/useUserRoles";
import { Permissions } from "@/libs/permissions/permissions";

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
  const [selectedCategory, setSelectedCategory] =
    useState<MembershipCategory | null>(null);

  const userEntity = useUserRoles();
  const canManage = Permissions.Organization.manage(userEntity);

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

  const ActionMenu = ({ category }: { category: MembershipCategory }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-background/20 data-[state=open]:bg-background/20"
          size="sm"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setSelectedCategory(category);
            setIsEditOpen(true);
          }}
          className="cursor-pointer"
        >
          <SquarePen className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setSelectedCategory(category);
            setIsDeleteOpen(true);
          }}
          className="cursor-pointer text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Membership Categories
        </h3>
        {canManage && (
          <Button className="gap-2" onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
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

      {/* Desktop View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table className="w-full [&_tr:last-child]:border-0">
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead className="text-left p-6 text-sm font-medium">
                Name
              </TableHead>
              <TableHead className="text-left p-6 text-sm font-medium">
                Description
              </TableHead>
              <TableHead className="text-right p-6 text-sm font-medium w-[100px]">
                Actions
              </TableHead>
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
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <p>No categories added yet</p>
                    <p className="text-sm">
                      Click the + button to add your first category
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="p-6">
                  <div className="font-medium text-sm">{category.name}</div>
                </TableCell>
                <TableCell className="p-6">
                  <div className="text-muted-foreground text-sm whitespace-pre-line">
                    {category.description}
                  </div>
                </TableCell>
                <TableCell className="text-right p-6">
                  {canManage && (
                    <div className="flex items-center justify-end gap-2">
                      <ActionMenu category={category} />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        )}
        {!isLoading && categories?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <p>No categories added yet</p>
              <p className="text-sm">
                Click the + button to add your first category
              </p>
            </CardContent>
          </Card>
        )}
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {category.name}
              </CardTitle>
              {canManage && <ActionMenu category={category} />}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <ResponsiveSheet
          isOpen={isEditOpen}
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
          isOpen={isDeleteOpen}
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
