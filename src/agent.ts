import { createGroq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import { checkAvailability, bookAppointment } from './tools.js'; 
import dotenv from 'dotenv';

dotenv.config();

export const clinicaAgent = new Agent({
  id: 'clinica-agent-01',
  name: 'Autonomous Clinical Agent',
  instructions: `Eres la recepcionista virtual de un laboratorio clínico.

  BASE DE DATOS INTERNA:
  - Horarios para mañana: 08:00 AM, 09:30 AM, 11:00 AM y 04:00 PM.

  REGLAS DE ATENCIÓN:
  1. Si el paciente pide disponibilidad, ofrécele los horarios de la base interna.
  2. Si el paciente confirma la cita (examen, día y hora), usa INMEDIATAMENTE la herramienta 'bookAppointment'.
  3. REGLA CRÍTICA: El teléfono del paciente ya viene en el prefijo oculto del mensaje ("El paciente con teléfono X dice:"). EXTRAE ESE NÚMERO Y ÚSALO EN LA HERRAMIENTA. ¡NUNCA le pidas su teléfono al usuario!
  4. Tras usar la herramienta, confirma el éxito y recuérdale las 8 horas de ayuno.
  5. Sé breve, conversacional y no pidas disculpas.`,
  model: createGroq({
    apiKey: process.env.GROQ_API_KEY
  })('llama-3.3-70b-versatile'),
  tools: { 
    checkAvailability, 
    bookAppointment 
  }
});

