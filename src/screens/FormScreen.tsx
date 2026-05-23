import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { ScreenProps } from "../navigation/typeNavigation";
import { formStyles } from "../theme/appStyles";
import { SpeciesFormValues } from "../types/species";
import { useImagePicker } from "../hooks/useImagePicker";
import {
  addSpecies,
  getSpeciesById,
  updateSpecies,
} from "../services/speciesServices";

type Props = ScreenProps<"Form">;

export const FormScreen = ({ route, navigation }: Props) => {
  const id = route.params?.speciesId;
  const isEditMode = id !== undefined;
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const { localUri, uploading, pickFromGallery, pickFromCamera, uploadImage } =
    useImagePicker();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpeciesFormValues>({
    defaultValues: {
      commonName: "",
      scientificName: "",
      habitat: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    const loadSpecies = async () => {
      if (!id) return;

      try {
        const data = await getSpeciesById(id);

        if (!data) {
          Alert.alert("Error", "No se encontró la especie.");
          navigation.goBack();
          return;
        }

        reset({
          commonName: data.commonName,
          scientificName: data.scientificName,
          habitat: data.habitat,
          imageUrl: data.imageUrl ?? "",
        });

        setExistingImageUrl(data.imageUrl ?? null);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la especie.");
        console.log(error);
      } finally {
        setLoadingData(false);
      }
    };

    loadSpecies();
  }, [id, navigation, reset]);

  const onSubmit = async (values: SpeciesFormValues) => {
    setSaving(true);

    try {
      if (isEditMode && id) {
        let imageUrl = existingImageUrl ?? "";

        if (localUri) {
          const url = await uploadImage(id);
          if (url) imageUrl = url;
        }

        await updateSpecies(id, {
          ...values,
          imageUrl,
        });

        Alert.alert("Actualizado", "Especie actualizada correctamente.");
      } else {
        const newId = await addSpecies({ ...values, imageUrl: "" });

        let imageUrl = "";
        if (localUri) {
          const url = await uploadImage(newId);
          if (url) imageUrl = url;
        }

        // Paso 3 solicitado en la tarea: guardar imageUrl en RTDB.
        if (imageUrl) {
          await updateSpecies(newId, { imageUrl });
        }

        Alert.alert("Creado", "Especie registrada correctamente.");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la especie. Intente de nuevo.");
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Seleccionar imagen", "¿Desde dónde quiere agregar la foto?", [
      { text: "Cámara", onPress: pickFromCamera },
      { text: "Galería", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const previewUri = localUri ?? existingImageUrl;

  if (loadingData) {
    return (
      <View style={formStyles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1a5c38" />
          <Text style={formStyles.uploadingText}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={formStyles.container}
        contentContainerStyle={formStyles.content}
      >
        <TouchableOpacity
          style={formStyles.imagePicker}
          onPress={showImageOptions}
        >
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={formStyles.imagePreview}
            />
          ) : (
            <View style={formStyles.imagePlaceholder}>
              <Text style={formStyles.imagePlaceholderIcon}>📸</Text>
              <Text style={formStyles.imagePlaceholderText}>
                Toca para agregar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {uploading && (
          <View style={formStyles.uploadingRow}>
            <ActivityIndicator size="small" color="#1a5c38" />
            <Text style={formStyles.uploadingText}>Subiendo imagen...</Text>
          </View>
        )}

        <View style={formStyles.form}>
          <View style={formStyles.fieldGroup}>
            <Text style={formStyles.fieldLabel}>Nombre común *</Text>
            <Controller
              control={control}
              name="commonName"
              rules={{ required: "El nombre común es obligatorio" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    formStyles.input,
                    errors.commonName && formStyles.inputError,
                  ]}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Ej: Árbol de la quina"
                  placeholderTextColor="#aaa"
                />
              )}
            />
            {errors.commonName && (
              <Text style={formStyles.errorText}>
                {errors.commonName.message}
              </Text>
            )}
          </View>

          <View style={formStyles.fieldGroup}>
            <Text style={formStyles.fieldLabel}>Nombre científico *</Text>
            <Controller
              control={control}
              name="scientificName"
              rules={{ required: "El nombre científico es obligatorio" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    formStyles.input,
                    errors.scientificName && formStyles.inputError,
                  ]}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Ej: Cinchona officinalis"
                  placeholderTextColor="#aaa"
                />
              )}
            />
            {errors.scientificName && (
              <Text style={formStyles.errorText}>
                {errors.scientificName.message}
              </Text>
            )}
          </View>

          <View style={formStyles.fieldGroup}>
            <Text style={formStyles.fieldLabel}>Hábitat *</Text>
            <Controller
              control={control}
              name="habitat"
              rules={{ required: "El hábitat es obligatorio" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    formStyles.input,
                    formStyles.inputMultiline,
                    errors.habitat && formStyles.inputError,
                  ]}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Ej: Bosque andino, 2000-3500 msnm"
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            {errors.habitat && (
              <Text style={formStyles.errorText}>{errors.habitat.message}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            formStyles.saveBtn,
            (saving || uploading) && formStyles.saveBtnDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={saving || uploading}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={formStyles.saveBtnText}>
              {isEditMode ? "💾  Guardar cambios" : "➕  Registrar especie"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
