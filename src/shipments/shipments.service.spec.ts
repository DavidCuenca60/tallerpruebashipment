import { ShipmentsService } from "./shipments.service";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { ShipmentEntity } from "./entities/shipment.entity";
import { ShipmentRulesService } from "./shipment-rules.service";
import { ShipmentStatus } from "./shipment-status.enum";

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


    it('is defined', () => {
        expect(service).toBeDefined();
    });

    it('returns all shipments', async () => {
    const shipments = [
      {
        id: 1,
        trackingCode: 'SHIP-001',
        destination: 'Cali',
        status: ShipmentStatus.CREATED,
      },
      {
        id: 2,
        trackingCode: 'SHIP-002',
        destination: 'Cartagena',
        status: ShipmentStatus.DISPATCHED,
      },
    ] as ShipmentEntity[];
    repository.find.mockResolvedValue(shipments);

    const result = await service.findAll();
 
    
    expect(result).toEqual(shipments);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });


  it('returns a shipment when the id exists', async () => {
    const shipment = {
      id: 7,
      trackingCode: 'SHIP-007',
      destination: 'Armenia',
      status: ShipmentStatus.CREATED,
    } as ShipmentEntity;
    repository.findOneBy.mockResolvedValue(shipment);
 

    const result = await service.findOne(7);
 
    
    expect(result).toEqual(shipment);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 7 });
  });

  

});