#include "DHT.h"
#include "WiFi.h"
#include "PubSubClient.h"

#define DHTPIN 23
#define DHTTYPE DHT11
#define LED_PIN 2

// Soil moisture
#define SOIL_A0 34
#define SOIL_D0 35

// Relay
#define RELAY_PIN 32
#define SOIL_THRESHOLD 5000   

// Light sensor
#define LIGHT_D0 25

const char *ssid = "Huy Nhan";
const char *password = "0985963012";

const char *mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

TaskHandle_t taskReadSensors;
TaskHandle_t taskLedBlink;

DHT dht(DHTPIN, DHTTYPE);

void setUpWiFi() {
  Serial.println("Kết nối WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối WiFi! IP:");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("thành công!");
    } else {
      Serial.print("Thất bại, mã lỗi: ");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

void TaskReadSensors(void *pvParameters) {
  for (;;) {

    if (!client.connected()) reconnectMQTT();
    client.loop();
    vTaskDelay(pdMS_TO_TICKS(10)); // tránh block

    // ---- DHT11 ----
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // ---- Soil moisture ----
    int soilAnalog = analogRead(SOIL_A0);
    int soilDigital = digitalRead(SOIL_D0);

    // ---- Light sensor ----
    int lightDigital = digitalRead(LIGHT_D0);

    // ====== Điều khiển bơm ======
    if (soilAnalog < SOIL_THRESHOLD) {
      digitalWrite(RELAY_PIN, LOW); // bật relay (low-trigger)
      Serial.println("Bơm: ON (đất khô)");
    } else {
      digitalWrite(RELAY_PIN, HIGH); // tắt
      Serial.println("Bơm: OFF (đủ ẩm)");
    }

    Serial.println("=== SENSOR DATA ===");
    Serial.printf("Temp: %.1f°C | Humidity: %.1f%%\n", t, h);
    Serial.printf("Soil A0: %d | Soil D0: %d\n", soilAnalog, soilDigital);
    Serial.printf("Light D0: %d\n", lightDigital);

    String payload = "{";
    payload += "\"temperature\":" + String(t, 1) + ",";
    payload += "\"humidity\":" + String(h, 1) + ",";
    payload += "\"soil_analog\":" + String(soilAnalog) + ",";
    payload += "\"soil_digital\":" + String(soilDigital) + ",";
    payload += "\"light_digital\":" + String(lightDigital);
    payload += "}";

    client.publish("home/sensors/data", payload.c_str());
    Serial.println("MQTT Sent: " + payload);

    vTaskDelay(pdMS_TO_TICKS(5000)); // đọc mỗi 5 giây
  }
}

void TaskLedBlink(void *pvParameters) {
  pinMode(LED_PIN, OUTPUT);

  for (;;) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(SOIL_D0, INPUT);
  pinMode(LIGHT_D0, INPUT);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // tắt relay mặc định

  dht.begin();
  setUpWiFi();
  client.setServer(mqtt_server, mqtt_port);

  xTaskCreatePinnedToCore(
      TaskReadSensors,
      "TaskReadSensors",
      4096,
      NULL,
      1,
      &taskReadSensors,
      0);

  xTaskCreatePinnedToCore(
      TaskLedBlink,
      "TaskLedBlink",
      2048,
      NULL,
      1,
      &taskLedBlink,
      1);
}

void loop() {
  // không dùng
}
