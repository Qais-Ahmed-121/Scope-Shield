"use server";

import { createClient } from "../../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: { fullName: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await (supabase.from("profiles") as any)
        .update({ 
            full_name: formData.fullName,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/dashboard", "layout");
    return { success: true };
}
