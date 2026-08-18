allprojects {
    repositories {
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
    tasks.withType<JavaCompile>().configureEach {
        sourceCompatibility = "11"
        targetCompatibility = "11"
    }
    tasks.matching { it.name.startsWith("compile") && it.name.contains("Kotlin") }.configureEach {
        try {
            val kotlinOptions = this.property("kotlinOptions")
            val setJvmTarget = kotlinOptions?.javaClass?.getMethod("setJvmTarget", String::class.java)
            setJvmTarget?.invoke(kotlinOptions, "11")
        } catch (e: Exception) {
            // Abaikan jika properti/metode tidak ada di task ini
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
