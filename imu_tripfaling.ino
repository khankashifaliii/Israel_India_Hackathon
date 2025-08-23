#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <math.h>

Adafruit_MPU6050 mpu;

// Pins
#define BUZZER_PIN 9     // Buzzer connected to D9
#define RED_LED_PIN 13   // Red LED (Fall detected)
#define GREEN_LED_PIN 12 // Green LED (Normal)

// Thresholds
#define IMPACT_THRESHOLD 15   // Impact acceleration
#define FREEFALL_THRESHOLD 3  // Near zero accel (free fall)
#define ANGLE_THRESHOLD 60    // degrees tilt

// System states
enum SystemState {
  NORMAL,
  FALL_DETECTED,
  ALERT_ACTIVE
};

// Timing constants
#define ALERT_DURATION 10000  // 10 seconds in milliseconds
#define BUZZER_INTERVAL 200   // Buzzer beep interval in ms

// Global variables
SystemState currentState = NORMAL;
unsigned long fallDetectedTime = 0;
unsigned long lastBuzzerToggle = 0;
bool buzzerOn = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip!");
    while (1) delay(10);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // Initialize pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  // Set initial state
  setNormalState();
  
  Serial.println("Fall Detection System Ready...");
  Serial.println("States: NORMAL -> FALL_DETECTED -> ALERT_ACTIVE -> NORMAL");
  delay(1000);
}

void loop() {
  // Read sensor data
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Calculate net acceleration
  float netAcc = sqrt(a.acceleration.x * a.acceleration.x +
                      a.acceleration.y * a.acceleration.y +
                      a.acceleration.z * a.acceleration.z);

  // Calculate pitch and roll angles
  float pitch = atan2(a.acceleration.y, a.acceleration.z) * 180 / PI;
  float roll  = atan2(-a.acceleration.x,
                      sqrt(a.acceleration.y * a.acceleration.y +
                           a.acceleration.z * a.acceleration.z)) * 180 / PI;

  // Check for fall condition
  bool fallCondition = ((netAcc < FREEFALL_THRESHOLD || netAcc > IMPACT_THRESHOLD) &&
                       (abs(pitch) > ANGLE_THRESHOLD || abs(roll) > ANGLE_THRESHOLD));

  // State machine logic
  handleStateMachine(fallCondition);

  // Print status to serial monitor
  printStatus(netAcc, pitch, roll, fallCondition);

  delay(100); // Reduced delay for better responsiveness
}

void handleStateMachine(bool fallCondition) {
  unsigned long currentTime = millis();
  
  switch (currentState) {
    case NORMAL:
      if (fallCondition) {
        currentState = FALL_DETECTED;
        fallDetectedTime = currentTime;
        setAlertState();
        Serial.println(">>> FALL DETECTED! Starting 10-second alert...");
      }
      break;
      
    case FALL_DETECTED:
      // Immediately transition to alert active
      currentState = ALERT_ACTIVE;
      break;
      
    case ALERT_ACTIVE:
      // Handle buzzer blinking during alert
      if (currentTime - lastBuzzerToggle >= BUZZER_INTERVAL) {
        toggleBuzzer();
        lastBuzzerToggle = currentTime;
      }
      
      // Check if alert duration has elapsed
      if (currentTime - fallDetectedTime >= ALERT_DURATION) {
        currentState = NORMAL;
        setNormalState();
        Serial.println(">>> Alert period ended. System returned to normal.");
      }
      break;
  }
}

void setNormalState() {
  // Turn off buzzer and red LED, turn on green LED
  noTone(BUZZER_PIN);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  buzzerOn = false;
}

void setAlertState() {
  // Turn off green LED, turn on red LED
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH);
  
  // Start buzzer
  buzzerOn = true;
  tone(BUZZER_PIN, 1000);
  lastBuzzerToggle = millis();
}

void toggleBuzzer() {
  if (buzzerOn) {
    noTone(BUZZER_PIN);
    buzzerOn = false;
  } else {
    tone(BUZZER_PIN, 1000);
    buzzerOn = true;
  }
}

void printStatus(float netAcc, float pitch, float roll, bool fallCondition) {
  // Print sensor readings
  Serial.print("Net Accel: "); 
  Serial.print(netAcc, 2); 
  Serial.print(" m/s² | Pitch: "); 
  Serial.print(pitch, 1); 
  Serial.print("° | Roll: "); 
  Serial.print(roll, 1); 
  Serial.print("° | ");
  
  // Print current state
  Serial.print("State: ");
  switch (currentState) {
    case NORMAL:
      Serial.print("NORMAL");
      break;
    case FALL_DETECTED:
      Serial.print("FALL_DETECTED");
      break;
    case ALERT_ACTIVE:
      Serial.print("ALERT_ACTIVE");
      unsigned long timeRemaining = ALERT_DURATION - (millis() - fallDetectedTime);
      Serial.print(" (");
      Serial.print(timeRemaining / 1000);
      Serial.print("s remaining)");
      break;
  }
  
  // Show fall detection status based on system state, not just current condition
  Serial.print(" | Fall Detected: ");
  if (currentState == ALERT_ACTIVE || currentState == FALL_DETECTED) {
    Serial.println("YES");
  } else {
    Serial.println(fallCondition ? "YES" : "NO");
  }
}