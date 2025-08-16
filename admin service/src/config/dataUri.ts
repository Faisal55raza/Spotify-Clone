import DataURIParser from "datauri/parser.js";

import path from "path";

const getBuffer = (file:any) => {
    const parser = new DataURIParser();
    return parser.format(path.extname(file.originalname).toString(), file.buffer);
};

export default getBuffer;
