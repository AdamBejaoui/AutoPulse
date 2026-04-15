import { parseListingText } from "./listingParser";

describe("Smart Listing Parser", () => {
  test("Case 1: 2019 Toyota Camry SE", () => {
    const title = "2019 Toyota Camry SE - 67k miles, clean title, one owner, automatic";
    const description = "Leather seats, backup camera, apple carplay. Runs perfect. No accidents ever.";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2019);
    expect(result.make).toBe("Toyota");
    expect(result.model).toBe("Camry");
    expect(result.trim).toBe("SE");
    expect(result.mileage).toBe(67000);
    expect(result.titleStatus).toBe("clean");
    expect(result.transmission).toBe("automatic");
    expect(result.owners).toBe(1);
    expect(result.accidents).toBe(false);
    expect(result.condition).toBe("excellent");
    expect(result.features).toEqual(expect.arrayContaining(["leather seats", "backup camera", "apple carplay"]));
  });

  test("Case 2: BMW 3 series 2020", () => {
    const title = "BMW 3 series 2020 white leather seats highway miles 45000";
    const description = "AWD, sunroof, navigation. Like new condition. 2 owners.";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2020);
    expect(result.make).toBe("BMW");
    expect(result.model).toBe("3 Series");
    expect(result.mileage).toBe(45000);
    expect(result.color).toBe("white");
    expect(result.driveType).toBe("AWD");
    expect(result.owners).toBe(2);
    expect(result.features).toEqual(expect.arrayContaining(["leather seats", "sunroof", "navigation"]));
  });

  test("Case 3: Honda Accord 2017 v6 sport", () => {
    const title = "Honda accord 2017 v6 sport runs great needs nothing 92k";
    const description = "Clean title, no rust, one owner, black, automatic";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2017);
    expect(result.make).toBe("Honda");
    expect(result.model).toBe("Accord");
    expect(result.trim).toBe("SPORT");
    expect(result.engine).toContain("V6");
    expect(result.mileage).toBe(92000);
    expect(result.titleStatus).toBe("clean");
    expect(result.color).toBe("black");
    expect(result.transmission).toBe("automatic");
    expect(result.condition).toBe("excellent");
  });

  test("Case 4: 2015 F150 XLT 4x4", () => {
    const title = "2015 F150 XLT 4x4 crew cab 5.0 V8 - 88,000 miles black";
    const description = "Tow package, bed liner, running boards. Needs new brakes. Salvage title.";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2015);
    expect(result.make).toBe("Ford");
    expect(result.model).toBe("F-150");
    expect(result.trim).toBe("XLT");
    expect(result.driveType).toBe("4WD");
    expect(result.engine).toContain("V8");
    expect(result.mileage).toBe(88000);
    expect(result.color).toBe("black");
    expect(result.titleStatus).toBe("salvage");
    expect(result.features).toEqual(expect.arrayContaining(["tow package", "bed liner", "running boards", "new brakes"]));
  });

  test("Case 5: Tesla Model 3 Long Range 2021", () => {
    const title = "Tesla Model 3 Long Range AWD 2021 - 34k mi white";
    const description = "Autopilot, premium sound, glass roof, wireless charging. Like new!";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2021);
    expect(result.make).toBe("Tesla");
    expect(result.model).toBe("Model 3");
    expect(result.driveType).toBe("AWD");
    expect(result.fuelType).toBe("electric");
    expect(result.mileage).toBe(34000);
    expect(result.color).toBe("white");
    expect(result.condition).toBe("excellent");
  });

  test("Case 6: Chevy Silverado 1500 2018", () => {
    const title = "chevy silverado 1500 2018 crew cab z71 4x4 diesel gray";
    const description = "125k miles, 2 owners, duramax diesel, tow pkg, bed liner. Runs great.";
    const result = parseListingText(title, description);

    expect(result.year).toBe(2018);
    expect(result.make).toBe("Chevrolet");
    expect(result.model).toBe("Silverado");
    expect(result.trim).toBe("Z71");
    expect(result.driveType).toBe("4WD");
    expect(result.fuelType).toBe("diesel");
    expect(result.mileage).toBe(125000);
    expect(result.color).toBe("gray");
    expect(result.owners).toBe(2);
  });
});
