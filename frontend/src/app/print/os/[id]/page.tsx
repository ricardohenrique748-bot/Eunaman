import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import PrintButtons from "./PrintButtons"

export default async function PrintOSPage(props: any) {
    const { id } = await props.params

    const os = await prisma.ordemServico.findUnique({
        where: { id },
        include: {
            veiculo: true,
            motivo: true,
            sistema: true,
            subSistema: true
        }
    })

    if (!os) return notFound()

    const formatDataHora = (data: Date) => {
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="w-full min-h-screen bg-white text-black print:bg-white font-sans text-xs">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                  @page { size: A4 landscape; margin: 4mm; }
                  body { 
                      background: white !important; 
                      -webkit-print-color-adjust: exact !important; 
                      print-color-adjust: exact !important;
                      margin: 0;
                      padding: 0;
                  }
                  nav, aside, header, footer, .no-print { display: none !important; }
                  .page-break { page-break-after: always; }
                }
                body { background: white; font-family: Arial, Helvetica, sans-serif !important; }
                .border-black { border-color: #000 !important; border-width: 1px !important; }
                .text-black { color: #000 !important; }
                .border-collapse { border-collapse: collapse; }
                th, td { padding: 4px; }
            `}} />

            <div className="mx-auto bg-white print:w-[287mm] print:h-[195mm] print:p-0 p-4 md:p-8 overflow-hidden" style={{ maxWidth: '1123px', width: '100%', fontFamily: 'Arial, Helvetica, sans-serif' }}>

                {/* Auto Print Script */}
                <script dangerouslySetInnerHTML={{ __html: `window.onload = () => window.print();` }} />

                {/* Top Header Row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    {/* Logo */}
                    <div className="w-64 shrink-0 pl-2 flex items-center h-12">
                        <span className="font-sans font-black tracking-tighter" style={{ color: '#116327', fontSize: '38px', transform: 'scaleX(1.15)', transformOrigin: 'left', fontStyle: 'italic', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                            EUNAMAN
                        </span>
                    </div>

                    {/* Title Box */}
                    <div className="flex-1 max-w-3xl flex flex-col border border-black h-12 justify-center">
                        <div className="text-center font-bold text-[13px] border-b border-black py-0.5 tracking-wide">ORDEM DE MANUTENÇÃO</div>
                        <div className="text-center text-[9px] font-bold py-0.5 uppercase tracking-wide">Preencher de acordo com as especificações listadas</div>
                    </div>

                    {/* Ordem Box (Floating Right) */}
                    <div className="w-32 shrink-0 text-center flex flex-col justify-center pt-2">
                        <div className="font-bold underline text-[11px] mb-1">Ordem N.:</div>
                        <div className="font-black text-xl text-red-600 tracking-wider">
                            {os.numeroOS.toString().padStart(5, '0')}
                        </div>
                    </div>
                </div>

                {/* Info Grid Container */}
                <div className="flex gap-4 mb-4">
                    {/* Main Details Box */}
                    <div className="flex-1 flex border border-black border-collapse">
                        {/* Left Column */}
                        <div className="w-1/2 flex flex-col border-r border-black">
                            <div className="flex border-b border-black h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Data/H Abertura:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] text-center flex items-center justify-center">{formatDataHora(os.dataAbertura)}</div>
                            </div>
                            <div className="flex border-b border-black h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Placa/Equipamento:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] text-center flex items-center justify-center">{os.veiculo?.placa || 'N/A'} / {os.veiculo?.codigoInterno}</div>
                            </div>
                            <div className="flex h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Horimetro:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] text-center flex items-center justify-center">{os.veiculo?.horimetroAtual || ''}</div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-1/2 flex flex-col">
                            <div className="flex border-b border-black h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">KM atual:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] px-2 flex items-center">{os.veiculo?.kmAtual || ''}</div>
                            </div>
                            <div className="flex border-b border-black h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Modelo Equipto:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] px-2 flex items-center">{os.veiculo?.modelo || 'N/A'}</div>
                            </div>
                            <div className="flex border-b border-black h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Modulo Origem:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] px-2 flex items-center">{os.sistema?.nome || ''}</div>
                            </div>
                            <div className="flex h-7">
                                <div className="w-32 p-1 border-r border-black font-bold text-[10px] flex items-center px-2">Local da Reparação:</div>
                                <div className="flex-1 p-1 font-bold text-[10px] px-2 flex items-center"></div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder to reserve space for the floating Ordem N. */}
                    <div className="w-32 shrink-0"></div>
                </div>

                {/* Tipo Manutenção */}
                <div className="flex gap-2 items-center mb-2 px-1 text-[11px]">
                    <span className="font-bold underline">Tipo Manutenção:</span>
                    <span className="font-bold uppercase">{os.tipoOS} {os.origem ? `- ${os.origem}` : ''}</span>
                    {os.descricao && <span className="font-[450] text-gray-600 ml-6 italic">MOTIVO: {os.descricao}</span>}
                </div>

                {/* Legendas */}
                <div className="border border-black mb-2 flex flex-col">
                    <div className="text-center font-bold text-[8px] p-0.5 border-b border-black uppercase tracking-wide">
                        CÓDIGOS DE LEGENDA PARA EXECUTOR DAS TAREFAS & STATUS/SITUAÇÃO
                    </div>
                    <div className="flex">
                        {/* Executores */}
                        <div className="flex-1 flex p-1 grid grid-cols-4 gap-x-2 gap-y-0 text-[8px] font-bold content-start">
                            <div>01 ALDY</div>
                            <div>05 IGOR</div>
                            <div>09 GEARLISON</div>
                            <div></div>

                            <div>02 FERNANDO</div>
                            <div>06 RODRIGO</div>
                            <div>10 JOÃO VITOR</div>
                            <div></div>

                            <div>03 FAGNER</div>
                            <div>07 RONALD</div>
                            <div>12 REGINALDO</div>
                            <div></div>

                            <div>04 HENRIQUE</div>
                            <div>08 LUCAS</div>
                            <div></div>
                            <div></div>
                        </div>
                        {/* Cores */}
                        <div className="w-[30%] border-l border-black text-[8px] font-bold text-white flex flex-col justify-between">
                            <div className="bg-[#10b981] p-1 border-b border-black h-1/4 flex items-center">01 EXECUTADO</div>
                            <div className="bg-[#eab308] p-1 border-b border-black text-black h-1/4 flex items-center">02 LIBERADO COM PENDÊNCIAS</div>
                            <div className="bg-[#ef4444] p-1 border-b border-black h-1/4 flex items-center">03 NÃO EXECUTADO</div>
                            <div className="bg-[#8b5cf6] p-1 h-1/4 flex items-center">04 NÃO SE APLICA</div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Tarefas */}
                <table className="w-full border-collapse border border-black text-[9px]">
                    <thead>
                        <tr className="bg-white">
                            <th className="border border-black p-1.5 w-10 text-center font-bold">TAREFA</th>
                            <th className="border border-black p-1.5 w-16 text-center font-bold">EXECUTOR</th>
                            <th className="border border-black p-1.5 text-left font-bold">DESCRIÇÃO DA TAREFA A REALIZAR</th>
                            <th className="border border-black p-1.5 w-16 text-center font-bold">TIPO</th>
                            <th className="border border-black p-1.5 w-20 text-center font-bold">DATA INICIO</th>
                            <th className="border border-black p-1.5 w-16 text-center font-bold">HORA INICIO</th>
                            <th className="border border-black p-1.5 w-20 text-center font-bold">DATA FINAL</th>
                            <th className="border border-black p-1.5 w-16 text-center font-bold">HORA FINAL</th>
                            <th className="border border-black p-1.5 w-16 text-center font-bold">SITUAÇÃO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(10)].map((_, i) => {
                            const isFirst = i === 0;
                            const dataInicioStr = isFirst && os.dataAbertura ? new Date(os.dataAbertura).toLocaleDateString('pt-BR') : '';
                            const horaInicioStr = isFirst && os.dataAbertura ? new Date(os.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                            const dataFinalStr = isFirst && os.dataConclusao ? new Date(os.dataConclusao).toLocaleDateString('pt-BR') : '';
                            const horaFinalStr = isFirst && os.dataConclusao ? new Date(os.dataConclusao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <tr key={i} className="h-7 border border-black">
                                    <td className="border border-black p-1 text-center font-bold">{i + 1}º</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1 font-bold text-[10px]">{isFirst ? os.descricao : ''}</td>
                                    <td className="border border-black p-1 text-center font-bold text-[8px]">{isFirst ? os.tipoOS : ''}</td>
                                    <td className="border border-black p-1 text-center">{dataInicioStr}</td>
                                    <td className="border border-black p-1 text-center">{horaInicioStr}</td>
                                    <td className="border border-black p-1 text-center">{dataFinalStr}</td>
                                    <td className="border border-black p-1 text-center">{horaFinalStr}</td>
                                    <td className="border border-black p-1"></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Observações */}
                <div className="border border-black border-t-0 border-b-0 text-center font-bold text-[10px] bg-white p-1">
                    OBSERVAÇÕES / TAREFAS EXECUTADAS ALÉM DO INFORMADO NA ORDEM
                </div>
                <div className="border border-black h-8"></div>
                <div className="border border-black border-t-0 h-8"></div>

                {/* Assinaturas */}
                <div className="mt-2 border border-black border-b-0 text-center font-bold text-[9px] bg-white p-0.5">
                    VISTO DOS RESPONSÁVEIS
                </div>
                <table className="w-full border-collapse border border-black text-[10px] text-center">
                    <thead>
                        <tr>
                            <th className="border border-black p-1.5 w-1/6 font-bold">EXECUTOR (s)</th>
                            <th className="border border-black p-1.5 w-1/6 font-bold">MANUTENÇÃO</th>
                            <th className="border border-black p-1.5 w-1/6 font-bold">PCM</th>
                            <th className="border border-black p-1.5 w-1/6 font-bold">SUZANO</th>
                            <th className="border border-black p-1.5 w-1/6 font-bold">MOTORISTA</th>
                            <th className="border border-black p-1.5 w-1/6 font-bold">DIVERSAS ASSINATURAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="h-10">
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1 font-bold">MARCOS</td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                        </tr>
                        <tr className="h-10">
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Controls (No-Print) */}
                <PrintButtons />

            </div>
        </div>
    )
}
