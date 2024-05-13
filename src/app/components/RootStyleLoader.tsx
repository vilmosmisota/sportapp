export default function RootStyleLoader() {
  return (
    <style>
      {`
          :root {
            --primary:  204, 94%, 15%;
            --secondary:  43, 100%, 51%;
            --secondary-muted: 43, 70%, 80%;
            --bar: 198, 64%, 75%;
            --bar-foreground: 0, 0%, 0%;

           
          }
        `}
    </style>
  );
}
