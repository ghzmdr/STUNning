import socket
import json

with open('../opcodes.json') as data:
    OP_CODES = json.load(data)

with open('../config.json') as data:
    config = json.load(data)

def createSocket (port):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(port)
    return s

def waitForAuth ():

def waitForPeer ():

def sendOp (socket, op):


