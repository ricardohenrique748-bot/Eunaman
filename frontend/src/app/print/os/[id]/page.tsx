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
        <div className="w-full min-h-screen bg-white text-black print:bg-transparent font-sans text-xs">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                  @page { size: A4 landscape; margin: 10mm; }
                  body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  nav, aside, header, footer, .no-print { display: none !important; }
                }
                body { background: white; }
                .border-black { border-color: #000 !important; border-width: 1px !important; }
                .text-black { color: #000 !important; }
                .border-collapse { border-collapse: collapse; }
                th, td { padding: 4px; }
            `}} />

            <div className="max-w-[1123px] mx-auto p-4 md:p-8 bg-white" style={{ maxWidth: '297mm' }}>

                {/* Auto Print Script */}
                <script dangerouslySetInnerHTML={{ __html: `window.onload = () => window.print();` }} />

                {/* Header Container */}
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-48 shrink-0">
                        {/* Logo placeholder, using the app's standard logo if available, or just text */}
                        <div className="font-black text-2xl text-green-700 tracking-tighter flex items-center gap-1">
                            <span className="text-3xl">⚙️</span>
                            EUNAMAN
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 border border-black h-full">
                        <div className="text-center font-bold text-sm border-b border-black py-1">ORDEM DE MANUTENÇÃO</div>
                        <div className="text-center text-[9px] font-bold py-1 uppercase">Preencher de acordo com as especificações listadas</div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-12 gap-0 mb-2 items-start">

                    {/* Left Panel */}
                    <div className="col-span-4 border border-black border-r-0 flex flex-col">
                        <div className="flex border-b border-black">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Data/H Abertura:</div>
                            <div className="flex-1 p-1 font-bold text-center text-[10px]">{formatDataHora(os.dataAbertura)}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Placa/Equipamento:</div>
                            <div className="flex-1 p-1 font-bold text-center text-[10px]">{os.veiculo?.placa || 'N/A'} / {os.veiculo?.codigoInterno}</div>
                        </div>
                        <div className="flex">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Horimetro:</div>
                            <div className="flex-1 p-1 font-bold text-center text-[10px]">{os.veiculo?.horimetroAtual || ''}</div>
                        </div>
                    </div>

                    {/* Middle Panel */}
                    <div className="col-span-6 border border-black flex flex-col">
                        <div className="flex border-b border-black">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">KM atual:</div>
                            <div className="flex-1 p-1 font-bold text-[10px]">{os.veiculo?.kmAtual || ''}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Modelo Equipto:</div>
                            <div className="flex-1 p-1 font-bold text-[10px]">{os.veiculo?.modelo || ''}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Modulo Origem:</div>
                            <div className="flex-1 p-1 font-bold text-[10px]">{os.sistema?.nome || ''} {os.subSistema?.nome ? `/ ${os.subSistema.nome}` : ''}</div>
                        </div>
                        <div className="flex">
                            <div className="w-32 p-1 border-r border-black font-bold text-[10px] bg-gray-100">Local da Reparação:</div>
                            <div className="flex-1 p-1 font-bold text-[10px]"></div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-2 flex flex-col items-center justify-center p-2">
                        <div className="text-center">
                            <div className="font-bold underline text-[11px] mb-1">Ordem N.:</div>
                            <div className="font-black text-lg text-red-600">{os.numeroOS.toString().padStart(5, '0')}</div>
                        </div>
                    </div>
                </div>

                {/* Tipo Manutenção */}
                <div className="flex gap-2 items-center mb-2 px-1">
                    <span className="font-bold underline text-[10px]">Tipo Manutenção:</span>
                    <span className="font-bold text-[10px] uppercase">{os.tipoOS} - {os.origem || 'MANUTENÇÃO'}</span>
                    {os.descricao && <span className="font-medium text-[10px] ml-4 text-gray-700 italic">MOTIVO: {os.descricao}</span>}
                </div>

                {/* Legendas */}
                <div className="border border-black mb-2">
                    <div className="text-center border-b border-black font-bold text-[9px] bg-gray-100 p-1">
                        CÓDIGOS DE LEGENDA PARA EXECUTOR DAS TAREFAS & STATUS/SITUAÇÃO
                    </div>
                    <div className="flex">
                        {/* Executores */}
                        <div className="w-2/3 flex p-1 grid grid-cols-4 gap-1 text-[8px] font-bold content-start">
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
                        <div className="w-1/3 border-l border-black text-[8px] font-bold text-white flex flex-col">
                            <div className="bg-[#10b981] p-1 border-b border-black">01 EXECUTADO</div>
                            <div className="bg-[#eab308] p-1 border-b border-black text-black">02 LIBERADO COM PENDÊNCIAS</div>
                            <div className="bg-[#ef4444] p-1 border-b border-black">03 NÃO EXECUTADO</div>
                            <div className="bg-[#8b5cf6] p-1">04 NÃO SE APLICA</div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Tarefas */}
                <table className="w-full border-collapse border border-black text-[9px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 w-10">TAREFA</th>
                            <th className="border border-black p-1 w-16">EXECUTOR</th>
                            <th className="border border-black p-1 text-left">DESCRIÇÃO DA TAREFA A REALIZAR</th>
                            <th className="border border-black p-1 w-12">TIPO</th>
                            <th className="border border-black p-1 w-20">DATA INICIO</th>
                            <th className="border border-black p-1 w-16">HORA INICIO</th>
                            <th className="border border-black p-1 w-20">DATA FINAL</th>
                            <th className="border border-black p-1 w-16">HORA FINAL</th>
                            <th className="border border-black p-1 w-16">SITUAÇÃO</th>
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
                <div className="border border-black border-t-0 border-b-0 text-center font-bold text-[9px] bg-gray-100 p-1">
                    OBSERVAÇÕES / TAREFAS EXECUTADAS ALÉM DO INFORMADO NA ORDEM
                </div>
                <div className="border border-black h-8"></div>
                <div className="border border-black border-t-0 h-8"></div>

                {/* Assinaturas */}
                <div className="mt-2 border border-black border-b-0 text-center font-bold text-[8px] bg-gray-100 p-0.5">
                    VISTO DOS RESPONSÁVEIS
                </div>
                <table className="w-full border-collapse border border-black text-[9px] text-center">
                    <thead>
                        <tr>
                            <th className="border border-black p-1 w-1/6">EXECUTOR (s)</th>
                            <th className="border border-black p-1 w-1/6">MANUTENÇÃO</th>
                            <th className="border border-black p-1 w-1/6">PCM</th>
                            <th className="border border-black p-1 w-1/6">SUZANO</th>
                            <th className="border border-black p-1 w-1/6">MOTORISTA</th>
                            <th className="border border-black p-1 w-1/6">DIVERSAS ASSINATURAS</th>
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
