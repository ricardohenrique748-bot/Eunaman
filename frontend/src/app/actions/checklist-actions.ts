'use server'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getVeiculosParaChecklist() {
  const { data, error } = await supabase
    .from('Veiculo')
    .select('id, codigoInterno, modelo, status')
    .order('codigoInterno')

  if (error) throw error
  return data
}

export async function savePremiumChecklist(payload: any) {
  try {
    const { veiculoId, respostas, assinatura, signatures } = payload

    // 1. Create the ChecklistResposta record
    const { data: checklist, error: ce } = await supabase
      .from('ChecklistResposta')
      .insert({
        id: uuidv4(),
        veiculoId,
        motoristaId: (await supabase.auth.getUser()).data.user?.id || null, // Best effort
        assinatura,
        localizacao: 'PREMIUM_UI',
      })
      .select('id')
      .single()

    if (ce) throw ce

    // 2. Insert the Item Resposta
    const itensToInsert = respostas.map((r: any) => ({
      id: uuidv4(),
      checklistRespostaId: checklist.id,
      checklistItemId: r.itemId,
      status: r.status,
      observacao: r.observacao || null,
      fotos: r.fotos || []
    }))

    const { error: ie } = await supabase
      .from('ChecklistItemResposta')
      .insert(itensToInsert)

    if (ie) throw ie

    // 3. SPECIAL PREMIUM LOGIC: 
    // If any item in "EQUIPAMENTO INTERDITADO" was NAO_OK, 
    // set vehicle status to "INTERDITADO" or "EM_MANUTENCAO"
    
    // For now we check if there's any NAO_OK in the entire set
    const hasNaoOk = respostas.some((r: any) => r.status === 'NAO_OK')
    
    if (hasNaoOk) {
      await supabase
        .from('Veiculo')
        .update({ status: 'INTERDITADO' })
        .eq('id', veiculoId)
    }

    return { success: true, id: checklist.id }
  } catch (error: any) {
    console.error('Error saving premium checklist:', error)
    return { success: false, error: error.message }
  }
}
