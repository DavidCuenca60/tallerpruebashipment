import { ShipmentsService } from "./shipments.service";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { ShipmentEntity } from "./entities/shipment.entity";
import { ShipmentRulesService } from "./shipment-rules.service";

describe('ShipmentsService', () => {
    let service: ShipmentsService;

    const repository = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const rulesService = {
        ensureCanBeDispatched: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
 
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShipmentsService,
                {
                    provide: getRepositoryToken(ShipmentEntity),
                    useValue: repository,
                },
                {
                    provide: ShipmentRulesService,
                    useValue: rulesService,
                },
            ],
        }).compile();
 
        service = module.get<ShipmentsService>(ShipmentsService);
    });

});