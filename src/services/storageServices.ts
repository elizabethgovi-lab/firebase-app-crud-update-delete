import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabase";

export const uploadSpeciesImage = async (
  localUri: string,
  speciesId: string,
): Promise<string> => {

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const filePath = `species/${speciesId}.jpg`;

  const { error } = await supabase.storage
    .from("species")
    .upload(filePath, decode(base64), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.log("Error al subir imagen:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("species")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteSpeciesImage = async (
  speciesId: string,
): Promise<void> => {

  const filePath = `species/${speciesId}.jpg`;

  try {
    await supabase.storage
      .from("species")
      .remove([filePath]);

  } catch (error) {
    console.log("No se pudo eliminar la imagen:", error);
  }
};