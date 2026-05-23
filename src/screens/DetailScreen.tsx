import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

import { ScreenProps } from "../navigation/typeNavigation";
import { detailStyles } from "../theme/appStyles";
import { Species } from "../types/species";
import { deleteSpecies, getSpeciesById } from "../services/speciesServices";
import { deleteSpeciesImage } from "../services/storageServices";

type Props = ScreenProps<"Detail">;

export const DetailScreen = ({ route, navigation }: Props) => {
  const { speciesId } = route.params;
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSpecies = async () => {
    try {
      const data = await getSpeciesById(speciesId);

      if (!data) {
        Alert.alert("Error", "No se encontró la especie.");
        navigation.goBack();
        return;
      }

      setSpecies(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el detalle.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadSpecies);
    return unsubscribe;
  }, [navigation, speciesId]);

  const confirmDelete = () => {
    if (!species) return;

    Alert.alert(
      "Confirmar eliminación",
      `¿Está seguro/a de eliminar ${species.commonName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (species.imageUrl) {
                await deleteSpeciesImage(species.id);
              }

              await deleteSpecies(species.id);
              Alert.alert("Eliminado", "La especie fue eliminada correctamente.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la especie.");
              console.log(error);
            }
          },
        },
      ],
    );
  };

  if (loading || !species) {
    return (
      <View style={detailStyles.center}>
        <ActivityIndicator size="large" color="#1a5c38" />
        <Text>Cargando detalle...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={detailStyles.container}
      contentContainerStyle={detailStyles.content}
    >
      {species.imageUrl ? (
        <Image source={{ uri: species.imageUrl }} style={detailStyles.image} />
      ) : (
        <View style={[detailStyles.image, detailStyles.imagePlaceholder]}>
          <Text style={{ fontSize: 64 }}>🌿</Text>
        </View>
      )}

      <View style={detailStyles.dataCard}>
        <Text style={detailStyles.commonName}>{species.commonName}</Text>
        <Text style={detailStyles.scientificName}>
          {species.scientificName}
        </Text>

        <View style={detailStyles.divider} />

        <View style={detailStyles.field}>
          <Text style={detailStyles.fieldLabel}>Hábitat</Text>
          <Text style={detailStyles.fieldValue}>{species.habitat}</Text>
        </View>
      </View>

      <View style={detailStyles.actions}>
        <TouchableOpacity
          style={detailStyles.editBtn}
          onPress={() => navigation.navigate("Form", { speciesId: species.id })}
        >
          <Text style={detailStyles.editBtnText}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={detailStyles.deleteBtn} onPress={confirmDelete}>
          <Text style={detailStyles.deleteBtnText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
