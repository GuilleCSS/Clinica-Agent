import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const checkAvailability = createTool({
  id: 'checkAvailability',
  description: 'Consulta los horarios disponibles en el calendario para una fecha específica.',
  inputSchema: z.object({
    date: z.string().describe('La fecha a consultar en formato YYYY-MM-DD'),
  }),
  execute: async ({ context }: any) => {
    console.log(`Consultando disponibilidad para: ${context.date}`);
    return { availableSlots: ["08:00 AM", "09:30 AM", "11:00 AM", "04:00 PM"] };
  }
});

export const bookAppointment = createTool({
  id: 'bookAppointment',
  description: 'Guarda una nueva cita médica en la base de datos.',
  inputSchema: z.object({
    patient_phone: z.string().describe('El número de teléfono del paciente'),
    test_type: z.string().describe('El tipo de examen (ej. Sangre, Orina)'),
    appointment_date: z.string().describe('Fecha y hora en formato ISO 8601')
  }),
  execute: async ({ context }: any) => {
    console.log(`Intentando agendar cita para ${context.patient_phone}...`);
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        { 
          patient_phone: context.patient_phone, 
          test_type: context.test_type, 
          appointment_date: context.appointment_date 
        }
      ]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: "Cita agendada exitosamente en el sistema." };
  }
});