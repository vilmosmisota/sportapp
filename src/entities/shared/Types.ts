import { MemberGender, MemberType } from "../member/Member.schema";

export enum CurrencyTypes {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export type BaseMember = {
  id: number;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: MemberGender | null;
  memberType: MemberType | null;
  userId: string | null;
  tenantId: number | null;
};
