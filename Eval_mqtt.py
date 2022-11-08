import paho.mqtt.client as mqtt
import time
import random

destinationServeur = "/compte/banque/"
destinationClient = "/compte/client/"

clientAcc = {}

def on_connect(client, userdata, flags, rc):
    client.subscribe(destinationServeur + "+/+")

def on_message(client, userdata, msg):
    acc = msg.topic.split("/")[3]
    amount = int(msg.payload) if msg.payload else 0
    if not acc in clientAcc.keys():
        clientAcc[acc] = 0
    if "/add" in msg.topic:
        clientAcc[acc] += amount
    elif "/del" in msg.topic:
        clientAcc[acc] -= amount
    client.publish(destinationClient + acc, clientAcc[acc])

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, 10)
client.loop_start()
print("connected")
while 1:
    time.sleep(10000)
    # Do nothing, everything is good here, just need to keep the program alive

