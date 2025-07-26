"use client";

import { useState } from 'react';
import { trackEvent } from '@/lib/usagey-client';
import { toast } from 'sonner';

const pricingModels = [
  {
    id: 'per-unit',
    name: 'Per Unit',
    description: 'Fixed price per unit of usage',
    basePrice: 10,
    tiers: [
      { 
        id: 1, 
        name: 'All Units', 
        startQuantity: 0, 
        endQuantity: null,
        pricePerUnit: 0.01, 
        flatFee: 0 
      }
    ]
  },
  {
    id: 'tiered',
    name: 'Tiered',
    description: 'Different rates for different usage volumes',
    basePrice: 0,
    tiers: [
      { 
        id: 1, 
        name: 'Tier 1', 
        startQuantity: 0, 
        endQuantity: 1000,
        pricePerUnit: 0.02, 
        flatFee: 0 
      },
      { 
        id: 2, 
        name: 'Tier 2', 
        startQuantity: 1001, 
        endQuantity: 10000,
        pricePerUnit: 0.01, 
        flatFee: 0 
      },
      { 
        id: 3, 
        name: 'Tier 3', 
        startQuantity: 10001, 
        endQuantity: null,
        pricePerUnit: 0.005, 
        flatFee: 0 
      }
    ]
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Base fee plus usage-based charges',
    basePrice: 49.99,
    tiers: [
      { 
        id: 1, 
        name: 'Included', 
        startQuantity: 0, 
        endQuantity: 5000,
        pricePerUnit: 0, 
        flatFee: 0 
      },
      { 
        id: 2, 
        name: 'Overage', 
        startQuantity: 5001, 
        endQuantity: null,
        pricePerUnit: 0.008, 
        flatFee: 0 
      }
    ]
  }
];

export default function PricingDemo() {
  const [selectedModel, setSelectedModel] = useState(pricingModels[0]);
  const [usageQuantity, setUsageQuantity] = useState(2500);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // Handle model selection
  const handleModelChange = (modelId: string) => {
    const model = pricingModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      calculateCost(model, usageQuantity);
    }
  };

  // Calculate cost based on pricing model and usage
  const calculateCost = (model = selectedModel, usage = usageQuantity) => {
    let cost = model.basePrice;
    let remainingUsage = usage;
    
    // Apply pricing model calculation
    switch (model.id) {
      case 'per-unit':
        // Simple multiplication
        cost += remainingUsage * model.tiers[0].pricePerUnit;
        break;
        
      case 'tiered':
        // Different rates for different tiers
        for (const tier of model.tiers) {
          if (remainingUsage <= 0) break;
          
          const tierStart = tier.startQuantity;
          const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
          const tierSize = tierEnd - tierStart + 1;
          
          // How much usage fits in this tier
          const usageInTier = Math.min(remainingUsage, tierSize);
          
          // Calculate cost for this tier
          cost += usageInTier * tier.pricePerUnit + tier.flatFee;
          
          // Reduce remaining usage
          remainingUsage -= usageInTier;
        }
        break;
        
      case 'hybrid':
        // Base fee is already added, only calculate usage charges
        for (const tier of model.tiers) {
          if (remainingUsage <= 0) break;
          
          const tierStart = tier.startQuantity;
          const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
          const tierSize = tierEnd - tierStart + 1;
          
          // How much usage fits in this tier
          const usageInTier = Math.min(remainingUsage, tierSize);
          
          // Calculate cost for this tier
          cost += usageInTier * tier.pricePerUnit + tier.flatFee;
          
          // Reduce remaining usage
          remainingUsage -= usageInTier;
        }
        break;
    }
    
    setCalculatedCost(cost);
    return cost;
  };

  // Simulate billing based on usage
  const simulateBilling = async () => {
    setIsLoading(true);
    setError(null);
    setSimulationComplete(false);
    
    try {
      // Track the simulation as a usage event
      await trackEvent('billing_simulation', usageQuantity, {
        pricingModel: selectedModel.id,
        calculatedCost: calculateCost()
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSimulationComplete(true);
      toast.success('Billing simulation completed successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pricing Models Demo</h1>
        <p className="text-gray-600">
          Explore different pricing models and see how they affect billing based on usage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pricing Model Selector */}
        <div className="lg:col-span-1">
          <div className="card space-y-6">
            <h2 className="text-xl font-semibold mb-4">Pricing Models</h2>
            
            <div className="space-y-4">
              {pricingModels.map(model => (
                <div 
                  key={model.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedModel.id === model.id 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModelChange(model.id)}
                >
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  {model.basePrice > 0 && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Base price:</span> ${model.basePrice.toFixed(2)}/month
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-2">Simulation Usage</h3>
              <div className="space-y-2">
                <label htmlFor="usageInput" className="text-sm text-gray-600">
                  Usage Quantity
                </label>
                <input
                  id="usageInput"
                  type="number"
                  min="1"
                  max="100000"
                  value={usageQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    setUsageQuantity(value);
                    calculateCost(selectedModel, value);
                  }}
                  className="input"
                />
              </div>

              <button 
                onClick={simulateBilling}
                disabled={isLoading}
                className="btn btn-primary w-full mt-4"
              >
                {isLoading ? 'Simulating...' : 'Simulate Billing'}
              </button>
              
              {simulationComplete && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                  Simulation completed! A usage event for this billing simulation has been recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Tiers and Billing Calculation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {selectedModel.name} Model Details
            </h2>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Per Unit
                      </th>
                      {selectedModel.id === 'hybrid' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedModel.tiers.map(tier => (
                      <tr key={tier.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tier.startQuantity.toLocaleString()} - {tier.endQuantity ? tier.endQuantity.toLocaleString() : '∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${tier.pricePerUnit.toFixed(4)}
                        </td>
                        {selectedModel.id === 'hybrid' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tier.startQuantity === 0 ? 'Included with base price' : 'Overage charges'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedModel.basePrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium">
                    Base Fee: ${selectedModel.basePrice.toFixed(2)}/month
                  </p>
                  {selectedModel.id === 'hybrid' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Includes the first 5,000 units at no additional cost.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Billing Calculation</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                <span className="font-medium">Usage Quantity</span>
                <span>{usageQuantity.toLocaleString()} units</span>
              </div>
              
              {calculatedCost !== null && (
                <div className="space-y-4">
                  {selectedModel.basePrice > 0 && (
                    <div className="flex justify-between items-center border-b pb-4">
                      <span>Base Fee</span>
                      <span>${selectedModel.basePrice.toFixed(2)}</span>
                    </div>
                  )}

                  {selectedModel.id === 'tiered' && selectedModel.tiers.map(tier => {
                    // Calculate usage in this tier
                    const tierStart = tier.startQuantity;
                    const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
                    const tierSize = tierEnd - tierStart;
                    
                    const usageInTier = Math.max(0, Math.min(usageQuantity - tierStart, tierSize));
                    
                    if (usageInTier <= 0) return null;
                    
                    const tierCost = usageInTier * tier.pricePerUnit;
                    
                    return (
                      <div key={tier.id} className="flex justify-between items-center">
                        <span>{tier.name} ({usageInTier.toLocaleString()} units @ ${tier.pricePerUnit.toFixed(4)})</span>
                        <span>${tierCost.toFixed(2)}</span>
                      </div>
                    );
                  })}

                  {selectedModel.id === 'per-unit' && (
                    <div className="flex justify-between items-center">
                      <span>{usageQuantity.toLocaleString()} units @ ${selectedModel.tiers[0].pricePerUnit.toFixed(4)}</span>
                      <span>${(usageQuantity * selectedModel.tiers[0].pricePerUnit).toFixed(2)}</span>
                    </div>
                  )}

                  {selectedModel.id === 'hybrid' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>First 5,000 units (included)</span>
                        <span>$0.00</span>
                      </div>
                      
                      {usageQuantity > 5000 && (
                        <div className="flex justify-between items-center">
                          <span>{(usageQuantity - 5000).toLocaleString()} additional units @ $0.008</span>
                          <span>${((usageQuantity - 5000) * 0.008).toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 font-bold">
                    <span>Total Monthly Cost</span>
                    <span className="text-xl">${calculatedCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-500">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How Pricing Models Work</h2>
            <div className="space-y-4 text-blue-800">
              <div>
                <h3 className="font-medium">Per Unit Pricing</h3>
                <p className="text-sm">
                  The simplest model. Each unit costs the same, regardless of volume. 
                  Total cost = base fee + (units × rate).
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Tiered Pricing</h3>
                <p className="text-sm">
                  Different rates for different usage volumes. Each tier has its own per-unit price.
                  Units are charged at the rate for their respective tier.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Hybrid Pricing</h3>
                <p className="text-sm">
                  Combines a base subscription fee with usage-based charges.
                  Typically includes a certain amount of usage, with overage charges for additional usage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}