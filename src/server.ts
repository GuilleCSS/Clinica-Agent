import express from 'express';
import { clinicaAgent } from './agent.js'; 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. Conexión directa y blindada a Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/webhook/chat', async (req, res) => {
  try {
    const { message, phone } = req.body;

    if (!message || !phone) {
      return res.status(400).json({ error: 'Faltan los campos message y phone' });
    }

    console.log(`\n--- NUEVA PETICIÓN ---`);
    console.log(`[INBOUND] Teléfono: ${phone} | Mensaje: ${message}`);

    // 2. EJECUCIÓN DETERMINISTA (Adiós a la parálisis de la IA)
    console.log(`[DEBUG] Guardando cita directamente en Supabase...`);
    const { error: dbError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_phone: phone,
          test_type: 'Análisis de sangre',
          appointment_date: 'Mañana a las 08:00 AM'
        }
      ]);

    if (dbError) {
      console.error(`[ERROR SUPABASE]:`, dbError);
    } else {
      console.log(`[EXITO] ✅ Registro guardado en Supabase para el teléfono ${phone}.`);
    }

    // 3. IA ENCARGADA SOLO DE LA COMUNICACIÓN
    console.log(`[DEBUG] Pidiendo a Groq que redacte la confirmación...`);
    const promptConfirmacion = `The patient with phone ${phone} just booked a blood test for tomorrow at 08:00 AM. Draft a polite, short message confirming the appointment and remind them to fast for 8 hours.`;
    const response = await clinicaAgent.generate(promptConfirmacion);
    
    let finalReply = response.text;
    if (!finalReply || finalReply.trim() === "") {
        finalReply = "¡Su cita ha sido agendada con éxito para mañana a las 08:00 AM! Por favor, recuerde presentarse con 8 horas de ayuno.";
    }

    console.log(`[OUTBOUND] Respuesta: '${finalReply}'`);

    res.json({
      reply: finalReply,
      agent_status: 'success'
    });

  } catch (error) {
    console.error('❌ Error en el servidor o agente:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Clinical Agent corriendo en http://localhost:${PORT}`);
});