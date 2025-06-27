import { PerformerForm } from "./Performer.schema";

import { MemberGender } from "./Member.schema";

import { MemberType } from "./Member.schema";
import { MemberGroupConnection, Performer } from "./Performer.schema";

export class PerformerData {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly dateOfBirth: string;
  public readonly gender: MemberGender;
  public readonly memberType: MemberType.Performer;
  public readonly tenantId: number | null;
  public readonly pin: number | undefined;
  public readonly groupConnections: MemberGroupConnection[];

  constructor(formData: PerformerForm) {
    this.firstName = formData.firstName;
    this.lastName = formData.lastName;
    this.dateOfBirth = formData.dateOfBirth;
    this.gender = formData.gender;
    this.memberType = formData.memberType;
    this.tenantId = formData.tenantId || null;
    this.pin = formData.pin;
    this.groupConnections = formData.groupConnections || [];
  }

  toServiceData(): Omit<Performer, "id" | "createdAt"> {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      memberType: this.memberType,
      tenantId: this.tenantId,
      pin: this.pin || null,
      groupConnections: this.groupConnections,
    };
  }

  static fromFormData(formData: PerformerForm): PerformerData {
    return new PerformerData(formData);
  }

  static createDefaultFormValues(tenantId: number): Partial<PerformerForm> {
    return {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      memberType: MemberType.Performer,
      tenantId: tenantId,
      pin: undefined,
      groupConnections: [],
    };
  }

  static createFormValuesFromPerformer(
    performer: Performer,
    tenantId?: number
  ): PerformerForm {
    return {
      firstName: performer.firstName || "",
      lastName: performer.lastName || "",
      dateOfBirth: performer.dateOfBirth || "",
      gender: performer.gender || MemberGender.Male,
      memberType: MemberType.Performer,
      tenantId: performer.tenantId || tenantId || undefined,
      pin: performer.pin || undefined,
      groupConnections: performer.groupConnections || [],
    };
  }
}
