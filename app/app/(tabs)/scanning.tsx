import {
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import * as ImagePicker from "expo-image-picker";

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [mode, setMode] = useState<CameraMode>("picture");
    const [facing, setFacing] = useState<CameraType>("back");
    const [recording, setRecording] = useState(false);

    if (!permission) {
        return null;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        if (photo?.uri) {
            setPhotos(prev => [...prev, photo.uri]);
            setIsCameraOpen(false);
        }
    };

    const recordVideo = async () => {
        if (recording) {
            setRecording(false);
            ref.current?.stopRecording();
            return;
        }
        setRecording(true);
        const video = await ref.current?.recordAsync();
        console.log({ video });
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    const deletePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setPhotos(prev => [...prev, uri]);
        }
    };

    const renderPhotoStrip = () => {
        return (
            <View style={styles.photoStrip}>
                {[0, 1, 2].map((index) => {
                    const uri = photos[index];

                    return (
                        <View key={index} style={styles.previewWrapper}>
                            {uri ? (
                                <>
                                    <Image
                                        source={{ uri }}
                                        style={styles.previewBox}
                                        contentFit="cover"
                                    />
                                    <Pressable
                                        style={styles.deleteButton}
                                        onPress={() => deletePhoto(index)}
                                    >
                                        <AntDesign name="close" size={20} color="white" />
                                    </Pressable>
                                </>
                            ) : (
                                <View style={styles.previewBox} />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };


    const renderCameraLauncher = () => {
        return (
            <Pressable onPress={() => setIsCameraOpen(true)} style={styles.cameraLauncher}>
                <AntDesign name="camera" size={80} color="black" />
            </Pressable>
        );
    };

    const renderCamera = () => {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    ref={ref}
                    mode={mode}
                    facing={facing}
                    mute={false}
                    responsiveOrientationWhenOrientationLocked
                />
                <View style={styles.shutterContainer}>
                    <Pressable onPress={toggleMode}>
                        {mode === "picture" ? (
                            <AntDesign name="picture" size={32} color="white" />
                        ) : (
                            <Feather name="video" size={32} color="white" />
                        )}
                    </Pressable>
                    <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
                        {({ pressed }) => (
                            <View
                                style={[
                                    styles.shutterBtn,
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.shutterBtnInner,
                                        {
                                            backgroundColor: mode === "picture" ? "white" : "red",
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>
                    <Pressable onPress={toggleFacing}>
                        <FontAwesome6 name="rotate-left" size={32} color="white" />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isCameraOpen
                ? renderCamera()
                : (
                    <>
                        {/* 1. Camera button */}
                        {photos.length < 3 && renderCameraLauncher()}

                        {/* 2. Upload button */}
                        {photos.length < 3 && (
                            <Pressable onPress={pickImage} style={styles.uploadButton}>
                                <Text style={styles.uploadButtonText}>Upload</Text>
                            </Pressable>
                        )}

                        {/* 3. Submit button*/}
                        {photos.length === 3 && (
                            <Pressable onPress={() => console.log("Submit pressed")} style={styles.submitButton}>
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </Pressable>
                        )}


                        {/* 4. Photo strip */}
                        {renderPhotoStrip()}
                    </>

                )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#6E6BAA",
        alignItems: "center",
        justifyContent: "flex-start",   // <-- important
        paddingTop: 40,                 // space from top
        paddingBottom: 160,      },
    cameraContainer: StyleSheet.absoluteFillObject,
    camera: StyleSheet.absoluteFillObject,
    shutterContainer: {
        position: "absolute",
        bottom: 44,
        left: 0,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 50,
    },
    photoStrip: {
        position: "absolute",
        bottom: 20,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        gap: 10,
    },

    previewBox: {
        width: 90,
        height: 90,
        borderRadius: 8,
        backgroundColor: "#ccc",
    },
    cameraLauncher: {
        marginTop: 20,
    },
    previewWrapper: {
        position: "relative",
    },

    deleteButton: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        padding: 2,
    },
    actionRow: {
        flexDirection: "row",
        gap: 40,
        marginTop: 20,
    },

    uploadLauncher: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    uploadButton: {
        marginTop: 20,
        backgroundColor: "#000",      // black button
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    uploadButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    submitButton: {
        marginTop: 30,
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    submitButtonText: {
        color: "#1E5F74", // or whatever matches your theme
        fontSize: 18,
        fontWeight: "700",
    },
});