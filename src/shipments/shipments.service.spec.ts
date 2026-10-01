import { ShipmentsService } from "./shipments.service";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { ShipmentEntity } from "./entities/shipment.entity";
import { ShipmentRulesService } from "./shipment-rules.service";
import { ShipmentStatus } from "./shipment-status.enum";
import { NotFoundException } from "@nestjs/common";
import { CreateShipmentDto } from "./dto/create-shipment.dto";

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


  it('throws NotFoundException when the id does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);
 
    const promise = service.findOne(999);
 
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
  });
 
  
  it('creates and saves a shipment', async () => {
    const data: CreateShipmentDto = {
      trackingCode: 'SHIP-100',
      destination: 'Cali',
    };
    const builtEntity = {
      ...data,
      status: ShipmentStatus.CREATED,
    } as ShipmentEntity;
    const savedEntity = { ...builtEntity, id: 1 } as ShipmentEntity;
    repository.create.mockReturnValue(builtEntity);
    repository.save.mockResolvedValue(savedEntity);
 
    const result = await service.create(data);
 
    expect(repository.create).toHaveBeenCalledWith({
      ...data,
      status: ShipmentStatus.CREATED,
    });
    expect(repository.save).toHaveBeenCalledWith(builtEntity);
    expect(result).toEqual(savedEntity);
  });
 

  it('dispatches and saves a valid shipment', async () => {
    const shipment = {
      id: 5,
      trackingCode: 'SHIP-005',
      destination: 'Cali',
      status: ShipmentStatus.CREATED,
    } as ShipmentEntity;
    const savedShipment = {
      ...shipment,
      status: ShipmentStatus.DISPATCHED,
    } as ShipmentEntity;
    repository.findOneBy.mockResolvedValue(shipment);
    repository.save.mockResolvedValue(savedShipment);
 
    const result = await service.dispatch(5);
 

    expect(rulesService.ensureCanBeDispatched).toHaveBeenCalledWith(shipment);
    expect(shipment.status).toBe(ShipmentStatus.DISPATCHED);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: ShipmentStatus.DISPATCHED }),
    );
    expect(result).toEqual(savedShipment);
  });

});