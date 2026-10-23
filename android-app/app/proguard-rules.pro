# JARVIS Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
-keep class androidx.room.RoomDatabase { *; }
-dontwarn com.google.mediapipe.**
