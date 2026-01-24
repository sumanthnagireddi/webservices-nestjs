import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should have imports', () => {
    const metadata = Reflect.getMetadata('imports', AppModule);
    expect(metadata).toBeDefined();
  });
});
