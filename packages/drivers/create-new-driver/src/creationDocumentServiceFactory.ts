/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { parse } from "url";
import {
    IDocumentService,
    IDocumentServiceFactory,
    IResolvedUrl,
} from "@microsoft/fluid-driver-definitions";
import { CreationDocumentService } from "./creationDocumentService";

/**
 * Factory for creating the faux document service. Use this if you want to
 * lie to runtime that there is an actual connection to server.
 */
export class CreationDocumentServiceFactory implements IDocumentServiceFactory {

    public readonly protocolName = "fluid-creation:";
    constructor() {
    }

    public async createDocumentService(resolvedUrl: IResolvedUrl): Promise<IDocumentService> {
        if (resolvedUrl.type !== "fluid") {
            // eslint-disable-next-line max-len
            return Promise.reject("Only Fluid components currently supported in the RouterliciousDocumentServiceFactory");
        }

        const fluidResolvedUrl = resolvedUrl;
        const parsedUrl = parse(fluidResolvedUrl.url);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [, , documentId] = parsedUrl.pathname!.split("/");
        return new CreationDocumentService(
            documentId,
            "createNewFileDocTenant");
    }
}