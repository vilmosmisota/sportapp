import { MemberType } from "../../member/Member.schema";
import { useUsers } from "../User.query";
import { UserDomain } from "../User.schema";

export const useParticipantUsers = (tenantId: string) => {
  const { data: users = [], ...rest } = useUsers(tenantId);

  const filteredUsers = users.filter(
    (user) =>
      // Check if user has PARTICIPANT domain
      user.userDomains?.includes(UserDomain.PARTICIPANT) ||
      // Check if user has a member with performer type
      user.member?.memberType === MemberType.Performer
  );

  return { ...rest, data: filteredUsers };
};
