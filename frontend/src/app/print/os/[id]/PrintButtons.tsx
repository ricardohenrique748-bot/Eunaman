'use client'

export default function PrintButtons() {
    return (
        <div className="mt-8 text-center no-print">
            <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">Imprimir Novamente</button>
            <button onClick={() => window.close()} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded shadow hover:bg-gray-300 ml-4">Voltar</button>
        </div>
    )
}
