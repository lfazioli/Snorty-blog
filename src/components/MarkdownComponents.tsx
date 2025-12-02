
export const components = {
h1: (props: any) => <h1 className="text-3xl font-bold my-4" {...props} />,
p: (props: any) => <p className="my-2 leading-relaxed" {...props} />,
MyCallout: ({ children }: any) => (
<div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">{children}</div>
),
}