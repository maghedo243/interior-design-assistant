import {
    CameraMode,
    CameraType,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import * as ImagePicker from "expo-image-picker";
import { Animated } from "react-native";


export default function ScanScreen() {
    // ============ STATE VARIABLES ============
    const [permission, requestPermission] = useCameraPermissions(); // Camera permissions
    const ref = useRef<CameraView>(null); // Reference to camera component
    const [photos, setPhotos] = useState<string[]>([]); // Array of photo URIs (max 3)
    const [isCameraOpen, setIsCameraOpen] = useState(false); // Whether camera is active
    const [mode, setMode] = useState<CameraMode>("picture"); // "picture" or "video"
    const [facing, setFacing] = useState<CameraType>("back"); // "front" or "back"
    const [recording, setRecording] = useState(false); // Whether video is recording
    const [loading, setLoading] = useState(false);
    const dot1Scale = useRef(new Animated.Value(1)).current;
    const dot2Scale = useRef(new Animated.Value(1)).current;
    const dot3Scale = useRef(new Animated.Value(1)).current;
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.stagger(150, [
                    Animated.sequence([
                        Animated.timing(dot1Scale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
                        Animated.timing(dot1Scale, { toValue: 1, duration: 300, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot2Scale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
                        Animated.timing(dot2Scale, { toValue: 1, duration: 300, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot3Scale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
                        Animated.timing(dot3Scale, { toValue: 1, duration: 300, useNativeDriver: true }),
                    ]),
                ])
            ).start();
        }
    }, [loading]);
    // ============ PERMISSION HANDLING ============
    // Show nothing while checking permissions
    if (!permission) {
        return null;
    }

    // Ask for permission if not granted
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

    // ============ CAMERA FUNCTIONS ============
    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        if (photo?.uri) {
            setPhotos(prev => [...prev, photo.uri]);
            setIsCameraOpen(false); // Close camera after taking photo
        }
    };

    const recordVideo = async () => {
        if (recording) {
            // Stop recording
            setRecording(false);
            ref.current?.stopRecording();
        } else {
            // Start recording
            setRecording(true);
            const video = await ref.current?.recordAsync();
            console.log({ video });
        }
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "picture" ? "video" : "picture"));
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    // ============ PHOTO MANAGEMENT ============
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

        setLoading(true);

        try {
            const formData = new FormData();

            photos.forEach((uri, index) => {
                formData.append("images", {
                    uri,
                    name: `photo-${index}.jpg`,
                    type: "image/jpeg",
                } as any);
            });

            const response = await fetch("http://192.168.1.165:5000/api/analyze-furniture", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Analyze error:", data);
                alert("Failed to analyze photos.");
                return;
            }

            console.log("Furniture analysis:", data);

             setResults(data.results)
        } catch (error) {
            console.error("Submit error:", error);
            alert("Something went wrong while submitting photos.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (photos.length === 0) {
            alert("Please add at least one photo.");
            return;
        }
    };

    // ============ RENDER FUNCTIONS ============

    // Shows 3 photo slots at the bottom with delete buttons
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

    // Button to open camera (only shows when we have less than 3 photos)
    const renderCameraLauncher = () => {
        return (
            <Pressable onPress={() => setIsCameraOpen(true)} style={styles.cameraLauncher}>
                <AntDesign name="camera" size={80} color="black" />
            </Pressable>
        );
    };

    // Full-screen camera view with controls
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

                {/* Camera controls (bottom of screen) */}
                <View style={styles.shutterContainer}>
                    {/* Toggle picture/video mode */}
                    <Pressable onPress={toggleMode}>
                        {mode === "picture" ? (
                            <AntDesign name="picture" size={32} color="white" />
                        ) : (
                            <Feather name="video" size={32} color="white" />
                        )}
                    </Pressable>

                    {/* Main shutter button */}
                    <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
                        {({ pressed }) => (
                            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
                                <View style={[
                                    styles.shutterBtnInner,
                                    { backgroundColor: mode === "picture" ? "white" : "red" }
                                ]} />
                            </View>
                        )}
                    </Pressable>

                    {/* Toggle front/back camera */}
                    <Pressable onPress={toggleFacing}>
                        <FontAwesome6 name="rotate-left" size={32} color="white" />
                    </Pressable>
                </View>
            </View>
        );
    };

    const renderResults = () => {
        if (!results || results.length === 0) {
            return null;
        }

        return (
            <View style={styles.resultsContainer}>
                {results.map((imageResult, imageIndex) => (
                    <View key={imageIndex} style={styles.resultCard}>
                        <Text style={styles.resultTitle}>{imageResult.fileName}</Text>

                        {imageResult.furniture.map((item: any, itemIndex: number) => (
                            <View key={itemIndex} style={styles.furnitureItem}>
                                <Text style={styles.furnitureHeading}>
                                    {item.category} → {item.color} {item.style} {item.category}
                                </Text>

                                <Text style={styles.furnitureDescription}>
                                    {item.description}
                                </Text>

                                <Text style={styles.confidenceText}>
                                    Confidence: {Math.round(item.confidence * 100)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    // ============ MAIN RENDER ============
    return (
        <View style={styles.container}>
            {isCameraOpen ? (
                renderCamera() // Show camera if open
            ) : (
                // Show main UI if camera is closed
                <View style={styles.mainUI}>
                    {/* Show camera & upload buttons if we need more photos */}
                    {photos.length < 3 && (
                        <View style={styles.buttonGroup}>
                            {renderCameraLauncher()}
                            <Pressable onPress={pickImage} style={styles.uploadButton}>
                                <Text style={styles.uploadButtonText}>Upload</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Show submit button when we have 3 photos */}
                    {photos.length === 3 && !loading && (
                        <Pressable
                            onPress={handleSubmit}
                            style={styles.submitButton}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </Pressable>
                    )}

                    {loading && (
                        <View style={styles.loaderContainer}>
                            <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot1Scale }] }]} />
                            <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot2Scale }] }]} />
                            <Animated.View style={[styles.loaderDot, { transform: [{ scale: dot3Scale }] }]} />
                        </View>
                    )}

                    {/* Always show photo strip */}
                    {renderResults()}

                    {renderPhotoStrip()}                </View>
            )}
        </View>
    );
}

// ============ STYLES ============
// Organized by component/function
const styles = StyleSheet.create({
    // Main container - handles basic layout
    container: {
        flex: 1,
        backgroundColor: "#6E6BAA",
    },

    // Main UI container (when camera is closed)
    mainUI: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",  // top content + bottom strip
        paddingTop: 60,
        paddingBottom: 40,
    },

    // Groups related buttons together
    buttonGroup: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },

    // ============ CAMERA STYLES ============
    cameraContainer: {
        ...StyleSheet.absoluteFillObject, // Takes up entire screen
    },
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    shutterContainer: {
        position: "absolute",
        bottom: 44,
        left: 0,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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

    // ============ PHOTO STRIP STYLES ============
    photoStrip: {
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

    // ============ BUTTON STYLES ============
    cameraLauncher: {
        marginBottom: 20, // Space between camera and upload button
        backgroundColor: "white",
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    uploadButton: {
        backgroundColor: "#000",
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
        backgroundColor: "#000000",
        paddingVertical: 14,
        paddingHorizontal: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center", // Centers horizontally
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },
    loaderContainer: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
    },

    loaderDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "white", // matches your Submit button aesthetic
    },
//========RENDERING STYLES================
    resultsContainer: {
        width: "90%",
        marginTop: 20,
    },

    resultCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },

    resultTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },

    furnitureItem: {
        marginBottom: 10,
    },

    furnitureHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },

    furnitureDescription: {
        fontSize: 14,
        color: "#333",
        marginTop: 4,
    },

    confidenceText: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
});
