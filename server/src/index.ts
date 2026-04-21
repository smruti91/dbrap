import { createServer } from "node:http";
import { createApplication } from "./app/index.js";

async function main() {

    try{
        const server = createServer(createApplication())
        const PORT =  5000;

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }catch(error){
        console.error('Error starting the server:', error);
        throw error;
    }
}

main();