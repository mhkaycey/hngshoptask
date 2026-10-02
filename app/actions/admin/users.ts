"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/validations/ids";
import { logAdminActivity } from "@/lib/adminActivity";

export type UserActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

function revalidateUsers(userId?: string) {
  revalidatePath("/admin/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}

export async function blockUser(userId: string): Promise<UserActionResult> {
  const admin = await requireAdmin();

  if (!isUuid(userId)) {
    return { success: false, message: "Invalid user id." };
  }

  if (admin.id === userId) {
    return { success: false, message: "You cannot block your own account." };
  }

  try {
    const { rowCount } = await query(
      `UPDATE users SET is_blocked = TRUE, updated_at = now() WHERE id = $1`,
      [userId]
    );
    if (rowCount !== 1) {
      return { success: false, message: "User not found." };
    }
    revalidateUsers(userId);
    await logAdminActivity({
      adminId: admin.id,
      action: "user.block",
      entityType: "user",
      entityId: userId,
      detail: "Blocked user",
    });
    return { success: true, message: "User blocked. They can no longer sign in or order." };
  } catch (error) {
    console.error("[admin] blockUser:", error);
    return { success: false, message: "Could not block the user." };
  }
}

export async function unblockUser(userId: string): Promise<UserActionResult> {
  const admin = await requireAdmin();

  if (!isUuid(userId)) {
    return { success: false, message: "Invalid user id." };
  }

  try {
    const { rowCount } = await query(
      `UPDATE users SET is_blocked = FALSE, updated_at = now() WHERE id = $1`,
      [userId]
    );
    if (rowCount !== 1) {
      return { success: false, message: "User not found." };
    }
    revalidateUsers(userId);
    await logAdminActivity({
      adminId: admin.id,
      action: "user.unblock",
      entityType: "user",
      entityId: userId,
      detail: "Unblocked user",
    });
    return { success: true, message: "User unblocked." };
  } catch (error) {
    console.error("[admin] unblockUser:", error);
    return { success: false, message: "Could not unblock the user." };
  }
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<UserActionResult> {
  const admin = await requireAdmin();

  if (!isUuid(userId)) {
    return { success: false, message: "Invalid user id." };
  }

  if (role !== "user" && role !== "admin") {
    return { success: false, message: "Invalid role." };
  }

  if (admin.id === userId) {
    return {
      success: false,
      message:
        role === "user"
          ? "You cannot demote your own account."
          : "You already have the admin role.",
    };
  }

  try {
    const { rowCount } = await query(
      `UPDATE users SET role = $2, updated_at = now() WHERE id = $1`,
      [userId, role]
    );
    if (rowCount !== 1) {
      return { success: false, message: "User not found." };
    }
    revalidateUsers(userId);
    await logAdminActivity({
      adminId: admin.id,
      action: role === "admin" ? "user.promote" : "user.demote",
      entityType: "user",
      entityId: userId,
      detail: role === "admin" ? "Promoted to admin" : "Demoted to user",
    });
    return {
      success: true,
      message: role === "admin" ? "User promoted to admin." : "User demoted to user.",
    };
  } catch (error) {
    console.error("[admin] setUserRole:", error);
    return { success: false, message: "Could not update the role." };
  }
}
