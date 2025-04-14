import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Client, Message } from 'paho-mqtt';

const comandos: string[] = ['Frente', 'Trás', 'Esquerda', 'Direita', 'Parar'];

const App: React.FC = () => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Gera um clientId único
    const clientId = 'clientId-' + Math.random().toString(16).substr(2, 8);
    // URL do seu broker HiveMQ Cloud
    const brokerUrl = 'URL_AQUI';

    // Cria o cliente Paho
    const client = new Client(brokerUrl, clientId);

    // Callbacks opcionais
    client.onConnectionLost = (responseObject) => {
      console.warn('⚠️ Conexão perdida:', responseObject.errorMessage);
    };
    client.onMessageArrived = (message: Message) => {
      console.log(`📥 Mensagem recebida em ${message.destinationName}: ${message.payloadString}`);
    };

    // Conecta ao broker
    client.connect({
      useSSL: true,
      userName: 'USER',    // seu usuário HiveMQ Cloud
      password: 'SENHA',   // sua senha HiveMQ Cloud
      onSuccess: () => {
        console.log('✅ Conectado ao broker MQTT!');
      },
      onFailure: (err) => {
        console.error('❌ Falha ao conectar:', err);
      },
    });

    clientRef.current = client;

    return () => {
      // Desconecta ao desmontar
      if (clientRef.current && clientRef.current.isConnected()) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const enviarComando = (comando: string): void => {
    const client = clientRef.current;
    if (client && client.isConnected()) {
      const msg = new Message(comando.toLowerCase());
      msg.destinationName = 'robo/comando';
      client.send(msg);
      console.log('📤 Enviado:', comando.toLowerCase());
    } else {
      console.warn('⚠️ Cliente MQTT não está conectado.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./WolfBotz.png')} style={styles.imagem} />
      <Text style={styles.titulo}>Choreta</Text>

      {comandos.map((cmd) => (
        <TouchableOpacity
          key={cmd}
          style={styles.botao}
          onPress={() => enviarComando(cmd)}
        >
          <Text style={styles.textoBotao}>{cmd}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagem: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  botao: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default App;
