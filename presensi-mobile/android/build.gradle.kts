allprojects {
    repositories {
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    tasks.matching { it.name.startsWith("compile") && it.name.contains("Kotlin") }.configureEach {
        try {
            val androidExt = project.extensions.findByName("android")
            val compileOptions = androidExt?.javaClass?.getMethod("getCompileOptions")?.invoke(androidExt)
            val targetCompat = compileOptions?.javaClass?.getMethod("getTargetCompatibility")?.invoke(compileOptions)
            if (targetCompat != null) {
                val javaTarget = targetCompat.toString()
                val kotlinOptions = this.property("kotlinOptions")
                val setJvmTarget = kotlinOptions?.javaClass?.getMethod("setJvmTarget", String::class.java)
                setJvmTarget?.invoke(kotlinOptions, javaTarget)
            }
        } catch (e: Exception) {
            // Abaikan jika refleksi gagal atau bukan proyek android
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
