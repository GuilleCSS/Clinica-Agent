import express from 'express';
import { clinicaAgent } from './agent.js'; 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. Conexión segura a Supabase (Usa variables de entorno)
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

    const hoy = new Date().toISOString().split('T')[0]; 

    // 2. CAPA DETERMINISTA: Guardado directo en base de datos

    console.log(`[DEBUG] Guardando cita directamente en Supabase...`);
    
    const { error: dbError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_phone: phone,
          test_type: 'Blood Test',
          appointment_date: 'Tomorrow at 10:00 AM' 
        }
      ]);

    if (dbError) {
      console.error(`[ERROR SUPABASE]:`, dbError.message);
    } else {
      console.log(`[EXITO] ✅ Registro guardado en Supabase.`);
    }

    // 3. CAPA GENERATIVA: Comunicación con el paciente
    console.log(`[DEBUG] Pidiendo a Groq que redacte la confirmación...`);
    
    const promptConfirmacion = `
      Context: A patient with phone ${phone} just booked a blood test for tomorrow at 10:00 AM.
      Task: Write a short, professional confirmation message in English. 
      Requirement: Remind them to fast for 8 hours. 
      Constraint: DO NOT try to use any tools. Just return a plain text response.
    `;

    // Usamos maxSteps: 0 para forzar una respuesta de texto pura y evitar errores de Tool Calling
    const response = await clinicaAgent.generate(promptConfirmacion, { 
      maxSteps: 0 
    });
    
    let finalReply = response.text;

    // Red de seguridad por si la IA devuelve un string vacío
    if (!finalReply || finalReply.trim() === "") {
        finalReply = "Your appointment has been successfully scheduled for tomorrow at 12:00 PM. Please remember to fast for 8 hours before your blood test.";
    }

    console.log(`[OUTBOUND] Respuesta: '${finalReply.trim()}'`);

    res.json({
      reply: finalReply.trim(),
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